import { NextRequest } from 'next/server';
import { clientRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ClientStatus } from '@prisma/client';

/**
 * GET /api/clients/[id]
 * جلب عميل معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const client = await clientRepository.findByIdWithRelations(id);

    if (!client) {
      return ApiResponseHelper.notFound('Client not found');
    }

    return ApiResponseHelper.success(client);
  }
);

/**
 * PUT /api/clients/[id]
 * تحديث عميل
 */
const updateClientSchema = z.object({
  clientName: z.string().min(1).optional(),
  companyName: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).optional(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const body = await req.json();
    const validatedData = updateClientSchema.parse(body);

    const existing = await clientRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Client not found');
    }

    const client = await clientRepository.update(id, validatedData);

    return ApiResponseHelper.success(client);
  }
);

/**
 * DELETE /api/clients/[id]
 * حذف عميل
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const existing = await clientRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Client not found');
    }

    await clientRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
