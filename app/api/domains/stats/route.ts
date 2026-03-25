import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

/**
 * GET /api/domains/stats
 * جلب إحصائيات النطاقات
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const stats = await domainRepository.getStats();
  const expiringSoon = await domainRepository.findExpiringSoon(30);

  return ApiResponseHelper.success({
    ...stats,
    expiringSoonList: expiringSoon.slice(0, 5), // أول 5 نطاقات
  });
});
