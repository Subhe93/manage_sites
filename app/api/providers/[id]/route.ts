import { NextRequest } from 'next/server';
import { serviceProviderRepository } from '@/lib/db/repositories/service-provider.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ProviderType } from '@prisma/client';

/**
 * GET /api/providers/[id]
 * جلب مزود خدمة معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid provider ID', 400);
    }

    const provider = await serviceProviderRepository.findByIdWithRelations(id);

    if (!provider) {
      return ApiResponseHelper.notFound('Provider not found');
    }

    return ApiResponseHelper.success(provider);
  }
);

/**
 * PUT /api/providers/[id]
 * تحديث مزود خدمة
 */
const updateProviderSchema = z.object({
  providerName: z.string().min(1).optional(),
  providerType: z.nativeEnum(ProviderType).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  supportEmail: z.string().email().optional().nullable(),
  supportPhone: z.string().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid provider ID', 400);
    }

    const body = await req.json();
    const validatedData = updateProviderSchema.parse(body);

    const existing = await serviceProviderRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Provider not found');
    }

    const provider = await serviceProviderRepository.update(id, validatedData);

    return ApiResponseHelper.success(provider);
  }
);

/**
 * DELETE /api/providers/[id]
 * حذف مزود خدمة
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid provider ID', 400);
    }

    const existing = await serviceProviderRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Provider not found');
    }

    await serviceProviderRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
