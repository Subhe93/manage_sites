import { NextRequest } from 'next/server';
import { serverRepository } from '@/lib/db/repositories/server.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const stats = await serverRepository.getStats();
  return ApiResponseHelper.success(stats);
});
