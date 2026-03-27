import { Prisma, EntityType, PermissionLevel } from '@prisma/client';
import { ApiResponseHelper } from './response';
import { ZodError } from 'zod';
import { withRequestContext } from './request-context';
import { NextRequest } from 'next/server';
import { getUserFromRequest, canAccess, UserPermissionInfo } from '@/lib/permissions';

/**
 * معالج الأخطاء المركزي
 */
export class ApiErrorHandler {
  static handle(error: unknown) {
    console.error('API Error:', error);

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }

    // Zod validation errors
    if (error instanceof ZodError) {
      return this.handleZodError(error);
    }

    // Custom API errors
    if (error instanceof ApiError) {
      return ApiResponseHelper.error(error.message, error.statusCode, error.code);
    }

    // Generic errors
    if (error instanceof Error) {
      return ApiResponseHelper.serverError(
        process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      );
    }

    return ApiResponseHelper.serverError();
  }

  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        return ApiResponseHelper.error(
          `${field} already exists`,
          409,
          'DUPLICATE_ENTRY'
        );

      case 'P2025':
        // Record not found
        return ApiResponseHelper.notFound('Record not found');

      case 'P2003':
        // Foreign key constraint violation
        return ApiResponseHelper.error(
          'Related record not found',
          400,
          'FOREIGN_KEY_VIOLATION'
        );

      case 'P2014':
        // Required relation violation
        return ApiResponseHelper.error(
          'Required relation is missing',
          400,
          'REQUIRED_RELATION_VIOLATION'
        );

      default:
        return ApiResponseHelper.serverError(
          process.env.NODE_ENV === 'development'
            ? `Database error: ${error.message}`
            : 'Database error occurred'
        );
    }
  }

  private static handleZodError(error: ZodError) {
    const errors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return ApiResponseHelper.validationError(errors);
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Async handler wrapper
 * يلتقط الأخطاء تلقائياً ويعالجها
 */
export function asyncHandler(
  handler: (req: any, context?: any) => Promise<Response>
) {
  return async (req: any, context?: any) => {
    return withRequestContext(req as Request, async () => {
      try {
        return await handler(req, context);
      } catch (error) {
        return ApiErrorHandler.handle(error);
      }
    });
  };
}

/**
 * Async handler with permission checking
 * يلتقط الأخطاء ويتحقق من الصلاحيات تلقائياً
 */
interface PermissionOptions {
  entityType: EntityType | null;
  level: PermissionLevel;
}

export function protectedHandler(
  options: PermissionOptions,
  handler: (req: NextRequest, context: any, user: UserPermissionInfo) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    return withRequestContext(req as Request, async () => {
      try {
        const user = await getUserFromRequest(req);
        if (!user) {
          return ApiResponseHelper.unauthorized('Authentication required');
        }
        if (!canAccess(user, options.entityType, options.level)) {
          return ApiResponseHelper.forbidden('You do not have permission to perform this action');
        }
        return await handler(req, context, user);
      } catch (error) {
        return ApiErrorHandler.handle(error);
      }
    });
  };
}
