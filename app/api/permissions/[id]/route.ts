import { NextRequest } from 'next/server';
import { PermissionRepository } from '@/lib/db/repositories/permission-repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { withRequestContext } from '@/lib/api/request-context';
import { z } from 'zod';
import { EntityType, PermissionLevel } from '@prisma/client';

const permissionRepository = new PermissionRepository();

const updatePermissionSchema = z.object({
  userId: z.number().int().positive().optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  entityId: z.number().int().positive().nullable().optional(),
  permissionLevel: z.nativeEnum(PermissionLevel).optional(),
  grantedBy: z.number().int().positive().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);

      if (isNaN(id)) {
        return ApiResponseHelper.error('Invalid permission ID', 400);
      }

      const permission = await permissionRepository.findByIdWithRelations(id);

      if (!permission) {
        return ApiResponseHelper.notFound('Permission not found');
      }

      return ApiResponseHelper.success(permission);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);

      if (isNaN(id)) {
        return ApiResponseHelper.error('Invalid permission ID', 400);
      }

      const body = await request.json();
      const validatedData = updatePermissionSchema.parse(body);

      const existingPermission = await permissionRepository.findById(id);

      if (!existingPermission) {
        return ApiResponseHelper.notFound('Permission not found');
      }

      const permission = await permissionRepository.update(id, validatedData);

      return ApiResponseHelper.success(permission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(error.errors);
      }
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);

      if (isNaN(id)) {
        return ApiResponseHelper.error('Invalid permission ID', 400);
      }

      const existingPermission = await permissionRepository.findById(id);

      if (!existingPermission) {
        return ApiResponseHelper.notFound('Permission not found');
      }

      await permissionRepository.delete(id);

      return ApiResponseHelper.success({ message: 'Permission deleted successfully' });
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}
