import { NextRequest } from 'next/server';
import { serviceProviderRepository } from '@/lib/db/repositories/service-provider.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const stats = await serviceProviderRepository.getStats();
  return ApiResponseHelper.success(stats);
});
