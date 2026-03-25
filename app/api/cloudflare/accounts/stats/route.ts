import { NextRequest } from 'next/server';
import { cloudflareAccountRepository } from '@/lib/db/repositories/cloudflare-account.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
/**
 * GET /api/cloudflare/accounts/stats
 * إحصائيات حسابات Cloudflare
 */
export const GET = asyncHandler(async (req: NextRequest) => {
    const stats = await cloudflareAccountRepository.getStats();
    return ApiResponseHelper.success(stats);
});