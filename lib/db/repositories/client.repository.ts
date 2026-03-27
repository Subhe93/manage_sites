import { Client, Prisma, ClientStatus } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface ClientFilters {
  status?: ClientStatus;
  country?: string;
  search?: string;
  accessibleIds?: number[];
}

export class ClientRepository extends BaseRepository<
  Client,
  Prisma.ClientCreateInput,
  Prisma.ClientUpdateInput,
  Prisma.ClientWhereInput
> {
  protected model = prisma.client;

  async findAllWithFilters(
    filters: ClientFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.ClientWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.search) {
      where.OR = [
        { clientName: { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by accessible IDs if provided (non-admin users)
    if (filters.accessibleIds && filters.accessibleIds.length > 0) {
      where.id = { in: filters.accessibleIds };
    }

    return this.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        costs: {
          orderBy: { nextBillingDate: 'asc' },
        },
        _count: {
          select: {
            domains: true,
            websites: true,
          },
        },
      },
      orderBy,
    });
  }

  async countWithFilters(filters: ClientFilters) {
    const where: Prisma.ClientWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.search) {
      where.OR = [
        { clientName: { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by accessible IDs if provided (non-admin users)
    if (filters.accessibleIds && filters.accessibleIds.length > 0) {
      where.id = { in: filters.accessibleIds };
    }

    return this.count(where);
  }

  /**
   * جلب عميل مع جميع المواقع والنطاقات
   */
  async findByIdWithRelations(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        domains: {
          include: {
            costs: true,
          },
        },
        websites: {
          include: {
            domain: true,
            costs: true,
          },
        },
        costs: {
          orderBy: { nextBillingDate: 'asc' },
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            domains: true,
            websites: true,
          },
        },
      },
    });
  }

  /**
   * جلب العملاء النشطين
   */
  async findActive() {
    return this.model.findMany({
      where: { status: 'active' },
      include: {
        _count: {
          select: {
            domains: true,
            websites: true,
          },
        },
      },
      orderBy: {
        clientName: 'asc',
      },
    });
  }

  /**
   * البحث في العملاء
   */
  async search(query: string) {
    return this.model.findMany({
      where: {
        OR: [
          { clientName: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            domains: true,
            websites: true,
          },
        },
      },
    });
  }

  /**
   * إحصائيات العملاء
   */
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
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * جلب العملاء حسب الدولة
   */
  async findByCountry(country: string) {
    return this.model.findMany({
      where: { country },
      include: {
        _count: {
          select: {
            domains: true,
            websites: true,
          },
        },
      },
    });
  }
}

export const clientRepository = new ClientRepository();
