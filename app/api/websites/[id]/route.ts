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
  domainId: z.number().optional(),
  clientId: z.number().optional(),
  serverAccountId: z.number().optional(),
  websiteType: z
    .enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce'])
    .optional(),
  framework: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  websiteUrl: z.string().url().optional(),
  adminUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  databaseName: z.string().optional(),
  databaseType: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
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

    const website = await websiteRepository.update(id, {
      ...validatedData,
      domain: validatedData.domainId ? { connect: { id: validatedData.domainId } } : undefined,
      client: validatedData.clientId ? { connect: { id: validatedData.clientId } } : undefined,
      serverAccount: validatedData.serverAccountId
        ? { connect: { id: validatedData.serverAccountId } }
        : undefined,
    } as any);

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
