import { NextRequest } from 'next/server';
import { PermissionRepository } from '@/lib/db/repositories/permission-repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { withRequestContext } from '@/lib/api/request-context';
import { z } from 'zod';
import { EntityType, PermissionLevel } from '@prisma/client';

const permissionRepository = new PermissionRepository();

const createPermissionSchema = z.object({
  userId: z.number().int().positive(),
  entityType: z.nativeEnum(EntityType),
  entityId: z.number().int().positive().nullable(),
  permissionLevel: z.nativeEnum(PermissionLevel),
  grantedBy: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  return withRequestContext(request, async () => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const userId = searchParams.get('userId');
      const entityType = searchParams.get('entityType');
      const permissionLevel = searchParams.get('permissionLevel');
      const search = searchParams.get('search');
      const sortBy = searchParams.get('sortBy') || 'grantedAt';
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

      const filters: any = {};

      if (userId && userId !== 'undefined') {
        filters.userId = parseInt(userId);
      }

      if (entityType && entityType !== 'undefined' && entityType !== 'all') {
        filters.entityType = entityType as EntityType;
      }

      if (permissionLevel && permissionLevel !== 'undefined' && permissionLevel !== 'all') {
        filters.permissionLevel = permissionLevel as PermissionLevel;
      }

      if (search && search !== 'undefined') {
        filters.search = search;
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [permissions, total] = await Promise.all([
        permissionRepository.findAllWithFilters(filters, page, pageSize, orderBy),
        permissionRepository.countWithFilters(filters),
      ]);

      return ApiResponseHelper.successWithPagination(
        { permissions },
        {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: page < Math.ceil(total / pageSize),
          hasPrev: page > 1,
        }
      );
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    try {
      const body = await request.json();
      const validatedData = createPermissionSchema.parse(body);

      const permission = await permissionRepository.create({
        user: {
          connect: { id: validatedData.userId },
        },
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        permissionLevel: validatedData.permissionLevel,
        ...(validatedData.grantedBy && {
          granter: {
            connect: { id: validatedData.grantedBy },
          },
        }),
      });

      return ApiResponseHelper.created(permission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(error.errors);
      }
      return ApiErrorHandler.handle(error);
    }
  });
}
