import { NextRequest } from 'next/server';
import { ActionType, EntityType, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { activityLogRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const actionType = searchParams.get('actionType');
  const entityType = searchParams.get('entityType');
  const userId = searchParams.get('userId');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const where: Prisma.ActivityLogWhereInput = {};

  if (actionType && actionType !== 'all' && actionType !== 'undefined') {
    where.actionType = actionType as ActionType;
  }

  if (entityType && entityType !== 'all' && entityType !== 'undefined') {
    where.entityType = entityType as EntityType;
  }

  if (userId && userId !== 'undefined') {
    where.userId = parseInt(userId, 10);
  }

  if (search && search.trim() !== '' && search !== 'undefined') {
    where.OR = [
      { entityName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      {
        user: {
          is: {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const orderBy: Record<string, 'asc' | 'desc'> = {};
  orderBy[sortBy] = sortOrder;

  const result = await activityLogRepository.paginate({
    page,
    pageSize,
    where,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    },
  });

  const groupedByActionType = await prisma.activityLog.groupBy({
    by: ['actionType'],
    where,
    _count: {
      _all: true,
    },
  });

  const byActionType = groupedByActionType.reduce<Record<string, number>>((acc, item) => {
    acc[item.actionType] = item._count._all;
    return acc;
  }, {});

  return ApiResponseHelper.successWithPagination(result.data, result.pagination, 200, {
    stats: {
      total: result.pagination.total,
      byActionType,
    },
  });
});
