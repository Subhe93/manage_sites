import { NextRequest } from 'next/server';
import { clientRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ClientStatus } from '@prisma/client';

/**
 * GET /api/clients
 * جلب جميع العملاء مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const status = searchParams.get('status');
  const country = searchParams.get('country');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const filters: any = {};

  if (status && status !== 'all' && status !== 'undefined') {
    filters.status = status as ClientStatus;
  }

  if (country && country !== 'all' && country !== 'undefined') {
    filters.country = country;
  }

  if (search && search.trim() !== '' && search !== 'undefined') {
    filters.search = search;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [clients, total] = await Promise.all([
    clientRepository.findAllWithFilters(filters, page, pageSize, orderBy),
    clientRepository.countWithFilters(filters),
  ]);

  return ApiResponseHelper.successWithPagination(
    clients,
    {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrev: page > 1,
    }
  );
});

/**
 * POST /api/clients
 * إنشاء عميل جديد
 */
const createClientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  companyName: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus),
  notes: z.string().optional().nullable(),
  createdBy: z.number().int().positive().optional().nullable(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createClientSchema.parse(body);

  const clientData: any = {
    clientName: validatedData.clientName,
    companyName: validatedData.companyName,
    email: validatedData.email,
    phone: validatedData.phone,
    address: validatedData.address,
    country: validatedData.country,
    status: validatedData.status,
    notes: validatedData.notes,
  };

  if (validatedData.createdBy) {
    clientData.creator = {
      connect: { id: validatedData.createdBy },
    };
  }

  const client = await clientRepository.create(clientData);

  return ApiResponseHelper.created(client);
});
