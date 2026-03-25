import { NextRequest } from 'next/server';
import { serviceProviderRepository } from '@/lib/db/repositories/service-provider.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ProviderType } from '@prisma/client';

/**
 * GET /api/providers
 * جلب جميع مزودي الخدمة مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const providerType = searchParams.get('providerType');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const filters: any = {};

  if (providerType && providerType !== 'all' && providerType !== 'undefined') {
    filters.providerType = providerType as ProviderType;
  }

  if (search && search.trim() !== '' && search !== 'undefined') {
    filters.search = search;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [providers, total] = await Promise.all([
    serviceProviderRepository.findAllWithFilters(filters, page, pageSize, orderBy),
    serviceProviderRepository.countWithFilters(filters),
  ]);

  return ApiResponseHelper.successWithPagination(
    providers,
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
 * POST /api/providers
 * إنشاء مزود خدمة جديد
 */
const createProviderSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required'),
  providerType: z.nativeEnum(ProviderType),
  websiteUrl: z.string().url().optional().nullable(),
  supportEmail: z.string().email().optional().nullable(),
  supportPhone: z.string().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createProviderSchema.parse(body);

  const provider = await serviceProviderRepository.create(validatedData);

  return ApiResponseHelper.created(provider);
});
