import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { DomainStatus, BillingCycle } from '@prisma/client';

/**
 * GET /api/domains
 * جلب جميع النطاقات مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const registrarId = searchParams.get('registrarId');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const filters: any = {};

  if (status && status !== 'all' && status !== 'undefined') {
    filters.status = status as DomainStatus;
  }

  if (clientId && clientId !== 'undefined') {
    filters.clientId = parseInt(clientId);
  }

  if (registrarId && registrarId !== 'undefined') {
    filters.registrarId = parseInt(registrarId);
  }

  if (search && search.trim() !== '' && search !== 'undefined') {
    filters.search = search;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [domains, total] = await Promise.all([
    domainRepository.findAllWithFilters(filters, page, pageSize, orderBy),
    domainRepository.countWithFilters(filters),
  ]);

  return ApiResponseHelper.successWithPagination(
    domains,
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
 * POST /api/domains
 * إنشاء نطاق جديد
 */
const createDomainSchema = z.object({
  domainName: z.string().min(1, 'Domain name is required'),
  tld: z.string().optional().nullable(),
  status: z.nativeEnum(DomainStatus),
  registrarId: z.number().int().positive().optional().nullable(),
  clientId: z.number().int().positive().optional().nullable(),
  cloudflareAccountId: z.number().int().positive().optional().nullable(),
  registrationDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  autoRenew: z.boolean().default(true),
  renewalNotificationDays: z.number().int().positive().default(30),
  whoisPrivacy: z.boolean().default(true),
  nameservers: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  costs: z.array(z.object({
    costAmount: z.number().positive(),
    currency: z.string(),
    billingCycle: z.nativeEnum(BillingCycle),
    purchaseDate: z.string().optional().nullable(),
    nextBillingDate: z.string().optional().nullable(),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })).optional(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createDomainSchema.parse(body);

  const domainData: any = {
    domainName: validatedData.domainName,
    tld: validatedData.tld,
    status: validatedData.status,
    registrationDate: validatedData.registrationDate ? new Date(validatedData.registrationDate) : null,
    expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
    autoRenew: validatedData.autoRenew,
    renewalNotificationDays: validatedData.renewalNotificationDays,
    whoisPrivacy: validatedData.whoisPrivacy,
    nameservers: validatedData.nameservers,
    notes: validatedData.notes,
  };

  if (validatedData.registrarId) {
    domainData.registrar = {
      connect: { id: validatedData.registrarId },
    };
  }

  if (validatedData.clientId) {
    domainData.client = {
      connect: { id: validatedData.clientId },
    };
  }

  if (validatedData.cloudflareAccountId) {
    domainData.cloudflareAccount = {
      connect: { id: validatedData.cloudflareAccountId },
    };
  }

  if (validatedData.costs && validatedData.costs.length > 0) {
    domainData.costs = {
      create: validatedData.costs.map((cost) => ({
        costAmount: cost.costAmount,
        currency: cost.currency,
        billingCycle: cost.billingCycle,
        purchaseDate: cost.purchaseDate ? new Date(cost.purchaseDate) : null,
        nextBillingDate: cost.nextBillingDate ? new Date(cost.nextBillingDate) : null,
        paymentMethod: cost.paymentMethod,
        notes: cost.notes,
      })),
    };
  }

  const domain = await domainRepository.create(domainData);

  return ApiResponseHelper.created(domain);
});
