import { ServiceProvider, Prisma, ProviderType } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface ServiceProviderFilters {
  providerType?: ProviderType;
  search?: string;
}

export class ServiceProviderRepository extends BaseRepository<
  ServiceProvider,
  Prisma.ServiceProviderCreateInput,
  Prisma.ServiceProviderUpdateInput,
  Prisma.ServiceProviderWhereInput
> {
  protected model = prisma.serviceProvider;

  async findAllWithFilters(
    filters: ServiceProviderFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.ServiceProviderWhereInput = {};

    if (filters.providerType) {
      where.providerType = filters.providerType;
    }

    if (filters.search) {
      where.OR = [
        { providerName: { contains: filters.search, mode: 'insensitive' } },
        { websiteUrl: { contains: filters.search, mode: 'insensitive' } },
        { supportEmail: { contains: filters.search, mode: 'insensitive' } },
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
            servers: true,
          },
        },
      },
      orderBy,
    });
  }

  async countWithFilters(filters: ServiceProviderFilters) {
    const where: Prisma.ServiceProviderWhereInput = {};

    if (filters.providerType) {
      where.providerType = filters.providerType;
    }

    if (filters.search) {
      where.OR = [
        { providerName: { contains: filters.search, mode: 'insensitive' } },
        { websiteUrl: { contains: filters.search, mode: 'insensitive' } },
        { supportEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.count(where);
  }

  async findByIdWithRelations(id: number) {
    return this.findById(id, {
      _count: {
        select: {
          domains: true,
          servers: true,
        },
      },
    });
  }

  async getStats() {
    const [total, byType] = await Promise.all([
      this.count(undefined),
      this.model.groupBy({
        by: ['providerType'],
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.providerType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const serviceProviderRepository = new ServiceProviderRepository();
