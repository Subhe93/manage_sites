import { CloudflareAccount, Prisma, CloudflareAccountStatus } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface CloudflareAccountFilters {
  status?: CloudflareAccountStatus;
  search?: string;
}

export class CloudflareAccountRepository extends BaseRepository<
  CloudflareAccount,
  Prisma.CloudflareAccountCreateInput,
  Prisma.CloudflareAccountUpdateInput,
  Prisma.CloudflareAccountWhereInput
> {
  protected model = prisma.cloudflareAccount;

  async findAllWithFilters(
    filters: CloudflareAccountFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.CloudflareAccountWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { accountName: { contains: filters.search, mode: 'insensitive' } },
        { accountEmail: { contains: filters.search, mode: 'insensitive' } },
        { accountId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: {
            domains: true,
          },
        },
      },
      orderBy,
    });
  }

  async countWithFilters(filters: CloudflareAccountFilters) {
    const where: Prisma.CloudflareAccountWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { accountName: { contains: filters.search, mode: 'insensitive' } },
        { accountEmail: { contains: filters.search, mode: 'insensitive' } },
        { accountId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.count(where);
  }

  async findByIdWithRelations(id: number) {
    return this.findById(id, {
      _count: {
        select: {
          domains: true,
        },
      },
    });
  }

  async getStats() {
    const [total, byStatus] = await Promise.all([
      this.count(undefined),
      this.model.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status as string] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const cloudflareAccountRepository = new CloudflareAccountRepository();
