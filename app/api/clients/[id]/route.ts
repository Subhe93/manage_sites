import { NextRequest } from 'next/server';
import { clientRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ClientStatus } from '@prisma/client';
import { getUserFromRequest, canAccess, canAccessEntity } from '@/lib/permissions';

/**
 * GET /api/clients/[id]
 * جلب عميل معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'client', 'view')) {
      return ApiResponseHelper.unauthorized('Access denied to clients');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const client = await clientRepository.findByIdWithRelations(id);

    if (!client) {
      return ApiResponseHelper.notFound('Client not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'client', id, 'view')) {
      return ApiResponseHelper.unauthorized('Access denied to this client');
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
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'client', 'edit')) {
      return ApiResponseHelper.unauthorized('Permission denied - edit access required');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const existing = await clientRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Client not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'client', id, 'edit')) {
      return ApiResponseHelper.unauthorized('Access denied to edit this client');
    }

    const body = await req.json();
    const validatedData = updateClientSchema.parse(body);

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
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'client', 'admin')) {
      return ApiResponseHelper.unauthorized('Permission denied - admin access required');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const existing = await clientRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Client not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'client', id, 'admin')) {
      return ApiResponseHelper.unauthorized('Access denied to delete this client');
    }

    await clientRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
