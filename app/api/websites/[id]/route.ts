import { NextRequest } from 'next/server';
import { websiteRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

/**
 * GET /api/websites/[id]
 * جلب موقع معين مع جميع العلاقات
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    const website = await websiteRepository.findByIdWithRelations(id);

    if (!website) {
      return ApiResponseHelper.notFound('Website not found');
    }

    return ApiResponseHelper.success(website);
  }
);

/**
 * PUT /api/websites/[id]
 * تحديث موقع
 */
const updateWebsiteSchema = z.object({
  websiteName: z.string().min(3).max(255).optional(),
  domainId: z.number().int().positive().optional().nullable(),
  clientId: z.number().int().positive().optional().nullable(),
  serverAccountId: z.number().int().positive().optional().nullable(),
  googleAdsAccountId: z.number().int().positive().optional().nullable(),
  googleAnalyticsAccountId: z.number().int().positive().optional().nullable(),
  googleSearchConsoleAccountId: z.number().int().positive().optional().nullable(),
  googleTagManagerAccountId: z.number().int().positive().optional().nullable(),
  websiteType: z
    .enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce'])
    .optional(),
  framework: z.string().optional().nullable(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  adminUrl: z.string().url().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  databaseName: z.string().optional().nullable(),
  databaseType: z.string().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived']).optional(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = updateWebsiteSchema.parse(body);

    const existing = await websiteRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Website not found');
    }

    const websiteData: any = {};

    if (validatedData.websiteName !== undefined) websiteData.websiteName = validatedData.websiteName;
    if (validatedData.websiteType !== undefined) websiteData.websiteType = validatedData.websiteType;
    if (validatedData.framework !== undefined) websiteData.framework = validatedData.framework;
    if (validatedData.environment !== undefined) websiteData.environment = validatedData.environment;
    if (validatedData.websiteUrl !== undefined) websiteData.websiteUrl = validatedData.websiteUrl;
    if (validatedData.adminUrl !== undefined) websiteData.adminUrl = validatedData.adminUrl;
    if (validatedData.apiEndpoint !== undefined) websiteData.apiEndpoint = validatedData.apiEndpoint;
    if (validatedData.databaseName !== undefined) websiteData.databaseName = validatedData.databaseName;
    if (validatedData.databaseType !== undefined) websiteData.databaseType = validatedData.databaseType;
    if (validatedData.status !== undefined) websiteData.status = validatedData.status;
    if (validatedData.description !== undefined) websiteData.description = validatedData.description;
    if (validatedData.notes !== undefined) websiteData.notes = validatedData.notes;

    if (validatedData.domainId !== undefined) {
      websiteData.domain =
        validatedData.domainId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.domainId } };
    }
    if (validatedData.clientId !== undefined) {
      websiteData.client =
        validatedData.clientId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.clientId } };
    }
    if (validatedData.serverAccountId !== undefined) {
      websiteData.serverAccount =
        validatedData.serverAccountId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.serverAccountId } };
    }
    if (validatedData.googleAdsAccountId !== undefined) {
      websiteData.googleAdsAccount =
        validatedData.googleAdsAccountId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.googleAdsAccountId } };
    }
    if (validatedData.googleAnalyticsAccountId !== undefined) {
      websiteData.googleAnalyticsAccount =
        validatedData.googleAnalyticsAccountId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.googleAnalyticsAccountId } };
    }
    if (validatedData.googleSearchConsoleAccountId !== undefined) {
      websiteData.googleSearchConsoleAccount =
        validatedData.googleSearchConsoleAccountId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.googleSearchConsoleAccountId } };
    }
    if (validatedData.googleTagManagerAccountId !== undefined) {
      websiteData.googleTagManagerAccount =
        validatedData.googleTagManagerAccountId === null
          ? { disconnect: true }
          : { connect: { id: validatedData.googleTagManagerAccountId } };
    }

    const website = await websiteRepository.update(id, websiteData);

    return ApiResponseHelper.success(website);
  }
);

/**
 * DELETE /api/websites/[id]
 * حذف موقع
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    const existing = await websiteRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Website not found');
    }

    await websiteRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
