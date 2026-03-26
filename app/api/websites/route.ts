import { NextRequest } from 'next/server';
import { websiteRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

/**
 * GET /api/websites
 * جلب جميع المواقع مع pagination وفلاتر
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
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  // بناء شروط البحث
  const where: any = {};
  if (status && status !== 'all' && status !== 'undefined') {
    where.status = status;
  }
  if (clientId && clientId !== 'undefined') {
    where.clientId = parseInt(clientId);
  }
  if (websiteType && websiteType !== 'all' && websiteType !== 'undefined') {
    where.websiteType = websiteType;
  }
  if (environment && environment !== 'all' && environment !== 'undefined') {
    where.environment = environment;
  }
  if (search && search.trim() !== '' && search !== 'undefined') {
    where.OR = [
      { websiteName: { contains: search, mode: 'insensitive' } },
      { websiteUrl: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const result = await websiteRepository.paginate({
    page,
    pageSize,
    where,
    orderBy,
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
          username: true,
          server: {
            select: {
              id: true,
              serverName: true,
            },
          },
        },
      },
      googleAdsAccount: {
        select: {
          id: true,
          accountName: true,
        },
      },
      googleAnalyticsAccount: {
        select: {
          id: true,
          accountName: true,
        },
      },
      googleSearchConsoleAccount: {
        select: {
          id: true,
          accountName: true,
        },
      },
      googleTagManagerAccount: {
        select: {
          id: true,
          accountName: true,
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
  domainId: z.number().int().positive().optional().nullable(),
  clientId: z.number().int().positive().optional().nullable(),
  serverAccountId: z.number().int().positive().optional().nullable(),
  googleAdsAccountId: z.number().int().positive().optional().nullable(),
  googleAnalyticsAccountId: z.number().int().positive().optional().nullable(),
  googleSearchConsoleAccountId: z.number().int().positive().optional().nullable(),
  googleTagManagerAccountId: z.number().int().positive().optional().nullable(),
  websiteType: z.enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce']),
  framework: z.string().optional().nullable(),
  environment: z.enum(['development', 'staging', 'production']),
  websiteUrl: z.string().url().optional().nullable(),
  adminUrl: z.string().url().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  databaseName: z.string().optional().nullable(),
  databaseType: z.string().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived']),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createWebsiteSchema.parse(body);

  const websiteData: any = {
    websiteName: validatedData.websiteName,
    websiteType: validatedData.websiteType,
    framework: validatedData.framework,
    environment: validatedData.environment,
    websiteUrl: validatedData.websiteUrl,
    adminUrl: validatedData.adminUrl,
    apiEndpoint: validatedData.apiEndpoint,
    databaseName: validatedData.databaseName,
    databaseType: validatedData.databaseType,
    status: validatedData.status,
    description: validatedData.description,
    notes: validatedData.notes,
  };

  if (validatedData.domainId) {
    websiteData.domain = { connect: { id: validatedData.domainId } };
  }
  if (validatedData.clientId) {
    websiteData.client = { connect: { id: validatedData.clientId } };
  }
  if (validatedData.serverAccountId) {
    websiteData.serverAccount = { connect: { id: validatedData.serverAccountId } };
  }
  if (validatedData.googleAdsAccountId) {
    websiteData.googleAdsAccount = { connect: { id: validatedData.googleAdsAccountId } };
  }
  if (validatedData.googleAnalyticsAccountId) {
    websiteData.googleAnalyticsAccount = { connect: { id: validatedData.googleAnalyticsAccountId } };
  }
  if (validatedData.googleSearchConsoleAccountId) {
    websiteData.googleSearchConsoleAccount = {
      connect: { id: validatedData.googleSearchConsoleAccountId },
    };
  }
  if (validatedData.googleTagManagerAccountId) {
    websiteData.googleTagManagerAccount = {
      connect: { id: validatedData.googleTagManagerAccountId },
    };
  }

  const website = await websiteRepository.create(websiteData);

  return ApiResponseHelper.created(website);
});
