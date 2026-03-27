import { NextRequest } from 'next/server';
import { clientRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ClientStatus, BillingCycle, CostType } from '@prisma/client';
import { getUserFromRequest, canAccess } from '@/lib/permissions';
import prisma from '@/lib/prisma';

/**
 * GET /api/clients
 * جلب جميع العملاء مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  // ✅ فحص الصلاحيات
  const user = await getUserFromRequest(req);
  if (!user) {
    return ApiResponseHelper.unauthorized('Not authenticated');
  }
  if (!canAccess(user, 'client', 'view')) {
    return ApiResponseHelper.unauthorized('Access denied to clients');
  }

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

  // 🔐 For non-admin users, only return accessible clients
  if (!['super_admin', 'admin'].includes(user.role)) {
    // Get all client IDs the user has access to
    const userClientPermissions = await prisma.userPermission.findMany({
      where: {
        userId: user.userId,
        entityType: 'client',
      },
      select: { entityId: true },
    });

    const accessibleClientIds = userClientPermissions
      .filter(p => p.entityId !== null)
      .map(p => p.entityId as number);

    // If user has specific client permissions, filter by those
    if (accessibleClientIds.length > 0) {
      filters.accessibleIds = accessibleClientIds;
    }
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
  costs: z.array(z.object({
    costAmount: z.number().positive(),
    currency: z.string(),
    billingCycle: z.nativeEnum(BillingCycle),
    costType: z.nativeEnum(CostType),
    description: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    nextBillingDate: z.string().optional().nullable(),
    autoRenew: z.boolean().default(true),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })).optional(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  // ✅ فحص الصلاحيات
  const user = await getUserFromRequest(req);
  if (!user) {
    return ApiResponseHelper.unauthorized('Not authenticated');
  }
  if (!canAccess(user, 'client', 'edit')) {
    return ApiResponseHelper.unauthorized('Permission denied - edit access required');
  }

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

  if (validatedData.costs && validatedData.costs.length > 0) {
    clientData.costs = {
      create: validatedData.costs.map((cost) => ({
        costAmount: cost.costAmount,
        currency: cost.currency,
        billingCycle: cost.billingCycle,
        costType: cost.costType,
        description: cost.description || null,
        startDate: cost.startDate ? new Date(cost.startDate) : null,
        nextBillingDate: cost.nextBillingDate ? new Date(cost.nextBillingDate) : null,
        autoRenew: cost.autoRenew,
        paymentMethod: cost.paymentMethod || null,
        notes: cost.notes || null,
      })),
    };
  }

  const client = await clientRepository.create(clientData);

  return ApiResponseHelper.created(client);
});
