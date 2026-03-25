import { NextRequest } from 'next/server';
import { cloudflareDomainRepository } from '@/lib/db/repositories/cloudflare-domain.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { SSLMode, CacheLevel, SecurityLevel } from '@prisma/client';

/**
 * GET /api/cloudflare/domains
 * جلب جميع نطاقات Cloudflare مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  
  const search = searchParams.get('search');
  const cloudflareAccountId = searchParams.get('accountId');
  const isActive = searchParams.get('isActive');
  
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const filters: any = {};
  
  if (search && search.trim() !== '') {
    filters.search = search;
  }
  
  if (cloudflareAccountId && cloudflareAccountId !== 'undefined') {
    filters.cloudflareAccountId = parseInt(cloudflareAccountId);
  }
  
  if (isActive && isActive !== 'all' && isActive !== 'undefined') {
    filters.isActive = isActive;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [domains, total] = await Promise.all([
    cloudflareDomainRepository.findAllWithFilters(filters, page, pageSize, orderBy),
    cloudflareDomainRepository.countWithFilters(filters),
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
 * POST /api/cloudflare/domains
 * إنشاء نطاق Cloudflare جديد
 */
const createDomainSchema = z.object({
  domainId: z.number().int().positive(),
  cloudflareAccountId: z.number().int().positive(),
  zoneId: z.string().optional().nullable(),
  nameservers: z.string().optional().nullable(),
  sslMode: z.nativeEnum(SSLMode),
  cacheLevel: z.nativeEnum(CacheLevel),
  securityLevel: z.nativeEnum(SecurityLevel),
  isActive: z.boolean().default(true),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createDomainSchema.parse(body);

  const cfDomain = await cloudflareDomainRepository.create({
    domain: { connect: { id: validatedData.domainId } },
    cloudflareAccount: { connect: { id: validatedData.cloudflareAccountId } },
    zoneId: validatedData.zoneId,
    nameservers: validatedData.nameservers,
    sslMode: validatedData.sslMode,
    cacheLevel: validatedData.cacheLevel,
    securityLevel: validatedData.securityLevel,
    isActive: validatedData.isActive,
  });

  return ApiResponseHelper.created(cfDomain);
});