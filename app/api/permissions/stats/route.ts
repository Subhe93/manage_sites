import { NextRequest } from 'next/server';
import { PermissionRepository } from '@/lib/db/repositories/permission-repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';

const permissionRepository = new PermissionRepository();

export async function GET(request: NextRequest) {
  try {
    const stats = await permissionRepository.getStats();
    return ApiResponseHelper.success(stats);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
