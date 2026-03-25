import { NextRequest } from 'next/server';
import { userRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import prisma from '@/lib/prisma';

/**
 * GET /api/users/stats
 * جلب إحصائيات المستخدمين
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const [total, active, inactive, byRole] = await Promise.all([
    userRepository.count(),
    userRepository.count({ isActive: true }),
    userRepository.count({ isActive: false }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
  ]);

  const stats = {
    total,
    active,
    inactive,
    byRole: byRole.map((item) => ({
      role: item.role,
      count: item._count,
    })),
  };

  return ApiResponseHelper.success(stats);
});
