import { NextRequest } from 'next/server';
import { websiteRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

/**
 * GET /api/websites
 * جلب جميع المواقع مع pagination
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const websiteType = searchParams.get('type');
  const environment = searchParams.get('environment');
  const search = searchParams.get('search');

  // إذا كان هناك بحث
  if (search) {
    const results = await websiteRepository.search(search);
    return ApiResponseHelper.success(results);
  }

  // بناء شروط البحث
  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId);
  if (websiteType) where.websiteType = websiteType;
  if (environment) where.environment = environment;

  const result = await websiteRepository.paginate({
    page,
    pageSize,
    where,
    orderBy: { websiteName: 'asc' },
    include: {
      domain: {
        select: {
          id: true,
          domainName: true,
        },
      },
      client: {
        select: {
          id: true,
          clientName: true,
        },
      },
      serverAccount: {
        select: {
          id: true,
          accountName: true,
          server: {
            select: {
              id: true,
              serverName: true,
            },
          },
        },
      },
      _count: {
        select: {
          credentials: true,
          costs: true,
          uptimeChecks: true,
        },
      },
    },
  });

  return ApiResponseHelper.successWithPagination(result.data, result.pagination);
});

/**
 * POST /api/websites
 * إنشاء موقع جديد
 */
const createWebsiteSchema = z.object({
  websiteName: z.string().min(3).max(255),
  domainId: z.number().optional(),
  clientId: z.number().optional(),
  serverAccountId: z.number().optional(),
  websiteType: z.enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce']),
  framework: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  websiteUrl: z.string().url().optional(),
  adminUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  databaseName: z.string().optional(),
  databaseType: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived']),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createWebsiteSchema.parse(body);

  const website = await websiteRepository.create({
    ...validatedData,
    domain: validatedData.domainId ? { connect: { id: validatedData.domainId } } : undefined,
    client: validatedData.clientId ? { connect: { id: validatedData.clientId } } : undefined,
    serverAccount: validatedData.serverAccountId
      ? { connect: { id: validatedData.serverAccountId } }
      : undefined,
  } as any);

  return ApiResponseHelper.created(website);
});
