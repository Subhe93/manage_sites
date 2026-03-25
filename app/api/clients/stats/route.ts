import { NextRequest } from 'next/server';
import { clientRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const stats = await clientRepository.getStats();
  return ApiResponseHelper.success(stats);
});
