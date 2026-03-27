import { NextRequest } from 'next/server';
import { serverRepository } from '@/lib/db/repositories/server.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ServerType, ServerStatus, ControlPanel } from '@prisma/client';
import { getUserFromRequest, canAccess, canAccessEntity } from '@/lib/permissions';

/**
 * GET /api/servers/[id]
 * جلب خادم معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'server', 'view')) {
      return ApiResponseHelper.unauthorized('Access denied to servers');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid server ID', 400);
    }

    const server = await serverRepository.findByIdWithRelations(id);

    if (!server) {
      return ApiResponseHelper.notFound('Server not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'server', id, 'view')) {
      return ApiResponseHelper.unauthorized('Access denied to this server');
    }

    return ApiResponseHelper.success(server);
  }
);

/**
 * PUT /api/servers/[id]
 * تحديث خادم
 */
const updateServerSchema = z.object({
  serverName: z.string().min(1).optional(),
  providerId: z.number().int().positive().optional().nullable(),
  serverType: z.nativeEnum(ServerType).optional(),
  ipAddress: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  operatingSystem: z.string().optional().nullable(),
  controlPanel: z.nativeEnum(ControlPanel).optional().nullable(),
  controlPanelUrl: z.string().url().optional().nullable(),
  cpuCores: z.number().int().positive().optional().nullable(),
  ramGb: z.number().int().positive().optional().nullable(),
  storageGb: z.number().int().positive().optional().nullable(),
  bandwidthGb: z.number().int().positive().optional().nullable(),
  status: z.nativeEnum(ServerStatus).optional(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'server', 'edit')) {
      return ApiResponseHelper.unauthorized('Permission denied - edit access required');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid server ID', 400);
    }

    const existing = await serverRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Server not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'server', id, 'edit')) {
      return ApiResponseHelper.unauthorized('Access denied to edit this server');
    }

    const body = await req.json();
    const validatedData = updateServerSchema.parse(body);

    const updateData: any = { ...validatedData };

    if ('providerId' in validatedData) {
      if (validatedData.providerId) {
        updateData.provider = {
          connect: { id: validatedData.providerId },
        };
      } else {
        updateData.provider = {
          disconnect: true,
        };
      }
      delete updateData.providerId;
    }

    const server = await serverRepository.update(id, updateData);

    return ApiResponseHelper.success(server);
  }
);

/**
 * DELETE /api/servers/[id]
 * حذف خادم
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    // ✅ فحص الصلاحيات
    const user = await getUserFromRequest(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Not authenticated');
    }
    if (!canAccess(user, 'server', 'admin')) {
      return ApiResponseHelper.unauthorized('Permission denied - admin access required');
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid server ID', 400);
    }

    const existing = await serverRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Server not found');
    }

    // ✅ فحص صلاحيات الكائن الفردي
    if (!canAccessEntity(user, 'server', id, 'admin')) {
      return ApiResponseHelper.unauthorized('Access denied to delete this server');
    }

    await serverRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
