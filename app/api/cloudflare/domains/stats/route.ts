import { NextRequest } from 'next/server';
import { cloudflareDomainRepository } from '@/lib/db/repositories/cloudflare-domain.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
/**
 * GET /api/cloudflare/domains/stats
 * إحصائيات نطاقات Cloudflare
 */
export const GET = asyncHandler(async (req: NextRequest) => {
    const stats = await cloudflareDomainRepository.getStats();
    return ApiResponseHelper.success(stats);
});