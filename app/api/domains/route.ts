import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

/**
 * GET /api/domains
 * جلب جميع النطاقات مع pagination
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');

  // بناء شروط البحث
  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId);

  const result = await domainRepository.paginate({
    page,
    pageSize,
    where,
    orderBy: { domainName: 'asc' },
    include: {
      client: {
        select: {
          id: true,
          clientName: true,
        },
      },
      registrar: {
        select: {
          id: true,
          providerName: true,
        },
      },
      _count: {
        select: {
          costs: true,
          websites: true,
        },
      },
    },
  });

  return ApiResponseHelper.successWithPagination(result.data, result.pagination);
});

/**
 * POST /api/domains
 * إنشاء نطاق جديد
 */
const createDomainSchema = z.object({
  domainName: z.string().min(3).max(255),
  tld: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending', 'suspended', 'deleted']),
  registrarId: z.number().optional(),
  clientId: z.number().optional(),
  registrationDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  autoRenew: z.boolean().default(true),
  renewalNotificationDays: z.number().default(30),
  whoisPrivacy: z.boolean().default(true),
  nameservers: z.string().optional(),
  notes: z.string().optional(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createDomainSchema.parse(body);

  // التحقق من عدم وجود نطاق بنفس الاسم
  const existing = await domainRepository.findByName(validatedData.domainName);
  if (existing) {
    return ApiResponseHelper.error('Domain already exists', 409, 'DUPLICATE_DOMAIN');
  }

  const domain = await domainRepository.create({
    ...validatedData,
    registrationDate: validatedData.registrationDate
      ? new Date(validatedData.registrationDate)
      : undefined,
    expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
    registrar: validatedData.registrarId
      ? { connect: { id: validatedData.registrarId } }
      : undefined,
    client: validatedData.clientId ? { connect: { id: validatedData.clientId } } : undefined,
  } as any);

  return ApiResponseHelper.created(domain);
});
