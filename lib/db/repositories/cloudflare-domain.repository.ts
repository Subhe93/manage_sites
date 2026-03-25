import { CloudflareDomain, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface CloudflareDomainFilters {
  cloudflareAccountId?: number;
  search?: string;
  isActive?: string | boolean;
}

export class CloudflareDomainRepository extends BaseRepository<
  CloudflareDomain,
  Prisma.CloudflareDomainCreateInput,
  Prisma.CloudflareDomainUpdateInput,
  Prisma.CloudflareDomainWhereInput
> {
  protected model = prisma.cloudflareDomain;

  async findAllWithFilters(
    filters: CloudflareDomainFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.CloudflareDomainWhereInput = {};

    if (filters.cloudflareAccountId) {
      where.cloudflareAccountId = filters.cloudflareAccountId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      where.OR = [
        { zoneId: { contains: filters.search, mode: 'insensitive' } },
        { domain: { domainName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        domain: {
          select: {
            id: true,
            domainName: true,
          },
        },
        cloudflareAccount: {
          select: {
            id: true,
            accountName: true,
            accountEmail: true,
          },
        },
      },
      orderBy,
    });
  }

  async countWithFilters(filters: CloudflareDomainFilters) {
    const where: Prisma.CloudflareDomainWhereInput = {};

    if (filters.cloudflareAccountId) {
      where.cloudflareAccountId = filters.cloudflareAccountId;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      where.OR = [
        { zoneId: { contains: filters.search, mode: 'insensitive' } },
        { domain: { domainName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.count(where);
  }

  async findByIdWithRelations(id: number) {
    return this.findById(id, {
      domain: {
        select: {
          id: true,
          domainName: true,
        },
      },
      cloudflareAccount: {
        select: {
          id: true,
          accountName: true,
          accountEmail: true,
        },
      },
    });
  }

  async getStats() {
    const [total, byStatus] = await Promise.all([
      this.count(undefined),
      this.model.groupBy({
        by: ['isActive'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.isActive ? 'active' : 'inactive'] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const cloudflareDomainRepository = new CloudflareDomainRepository();
