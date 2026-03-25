import { NextRequest } from 'next/server';
import { cloudflareAccountRepository } from '@/lib/db/repositories/cloudflare-account.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { CloudflareAccountStatus } from '@prisma/client';

/**
 * GET /api/cloudflare/accounts/[id]
 * جلب حساب Cloudflare معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid account ID', 400);
    }

    const account = await cloudflareAccountRepository.findByIdWithRelations(id);

    if (!account) {
      return ApiResponseHelper.notFound('Cloudflare account not found');
    }

    return ApiResponseHelper.success(account);
  }
);

/**
 * PUT /api/cloudflare/accounts/[id]
 * تحديث حساب Cloudflare
 */
const updateAccountSchema = z.object({
  accountName: z.string().min(1).optional(),
  accountEmail: z.string().email().optional(),
  accountId: z.string().optional().nullable(),
  status: z.nativeEnum(CloudflareAccountStatus).optional(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid account ID', 400);
    }

    const body = await req.json();
    const validatedData = updateAccountSchema.parse(body);

    const existing = await cloudflareAccountRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Cloudflare account not found');
    }

    const account = await cloudflareAccountRepository.update(id, validatedData);

    return ApiResponseHelper.success(account);
  }
);

/**
 * DELETE /api/cloudflare/accounts/[id]
 * حذف حساب Cloudflare
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid account ID', 400);
    }

    const existing = await cloudflareAccountRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Cloudflare account not found');
    }

    await cloudflareAccountRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
