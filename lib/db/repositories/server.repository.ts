import { Server, Prisma, ServerType, ServerStatus, ControlPanel } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface ServerFilters {
  serverType?: ServerType;
  status?: ServerStatus;
  providerId?: number;
  search?: string;
}

export class ServerRepository extends BaseRepository<
  Server,
  Prisma.ServerCreateInput,
  Prisma.ServerUpdateInput,
  Prisma.ServerWhereInput
> {
  protected model = prisma.server;

  async findAllWithFilters(
    filters: ServerFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.ServerWhereInput = {};

    if (filters.serverType) {
      where.serverType = filters.serverType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.search) {
      where.OR = [
        { serverName: { contains: filters.search, mode: 'insensitive' } },
        { ipAddress: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        provider: {
          select: {
            id: true,
            providerName: true,
            providerType: true,
          },
        },
        costs: {
          select: {
            id: true,
            costAmount: true,
            currency: true,
            billingCycle: true,
            nextBillingDate: true,
          },
          take: 1,
        },
        _count: {
          select: {
            accounts: true,
            costs: true,
            monitoring: true,
            websites: true,
          },
        },
      },
      orderBy,
    });
  }

  async countWithFilters(filters: ServerFilters) {
    const where: Prisma.ServerWhereInput = {};

    if (filters.serverType) {
      where.serverType = filters.serverType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.search) {
      where.OR = [
        { serverName: { contains: filters.search, mode: 'insensitive' } },
        { ipAddress: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.count(where);
  }

  async findByIdWithRelations(id: number) {
    return this.findById(id, {
      provider: {
        select: {
          id: true,
          providerName: true,
          providerType: true,
        },
      },
      _count: {
        select: {
          accounts: true,
          costs: true,
          monitoring: true,
          websites: true,
        },
      },
    });
  }

  async getStats() {
    const [total, byType, byStatus] = await Promise.all([
      this.count(undefined),
      this.model.groupBy({
        by: ['serverType'],
        _count: true,
      }),
      this.model.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.serverType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const serverRepository = new ServerRepository();
