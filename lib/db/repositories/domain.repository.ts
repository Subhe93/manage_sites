import { Domain, Prisma, DomainStatus } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export interface DomainFilters {
  status?: DomainStatus;
  clientId?: number;
  registrarId?: number;
  search?: string;
  accessibleIds?: number[];
}

export class DomainRepository extends BaseRepository<
  Domain,
  Prisma.DomainCreateInput,
  Prisma.DomainUpdateInput,
  Prisma.DomainWhereInput
> {
  protected model = prisma.domain;

  async findAllWithFilters(
    filters: DomainFilters,
    page: number = 1,
    pageSize: number = 10,
    orderBy: any = { createdAt: 'desc' }
  ) {
    const where: Prisma.DomainWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.registrarId) {
      where.registrarId = filters.registrarId;
    }

    if (filters.search) {
      where.OR = [
        { domainName: { contains: filters.search, mode: 'insensitive' } },
        { tld: { contains: filters.search, mode: 'insensitive' } },
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
        client: {
          select: {
            id: true,
            clientName: true,
            companyName: true,
          },
        },
        registrar: {
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
          },
          take: 1,
        },
        _count: {
          select: {
            costs: true,
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

  async countWithFilters(filters: DomainFilters) {
    const where: Prisma.DomainWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.registrarId) {
      where.registrarId = filters.registrarId;
    }

    if (filters.search) {
      where.OR = [
        { domainName: { contains: filters.search, mode: 'insensitive' } },
        { tld: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    // Filter by accessible IDs if provided (non-admin users)
    if (filters.accessibleIds && filters.accessibleIds.length > 0) {
      where.id = { in: filters.accessibleIds };
    }
    return this.count(where);
  }

  async findByIdWithRelations(id: number) {
    return this.findById(id, {
      client: {
        select: {
          id: true,
          clientName: true,
          companyName: true,
        },
      },
      registrar: {
        select: {
          id: true,
          providerName: true,
          providerType: true,
        },
      },
      costs: true,
      website: true,
      _count: {
        select: {
          costs: true,
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

  /**
   * جلب نطاق باسمه
   */
  async findByName(domainName: string) {
    return this.model.findUnique({
      where: { domainName },
      include: {
        client: true,
        registrar: true,
        costs: true,
      },
    });
  }

  /**
   * جلب النطاقات التي ستنتهي قريباً
   */
  async findExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.model.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        status: 'active',
      },
      include: {
        client: true,
        registrar: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  /**
   * جلب النطاقات المنتهية
   */
  async findExpired() {
    return this.model.findMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        status: {
          not: 'expired',
        },
      },
      include: {
        client: true,
      },
    });
  }

  /**
   * جلب نطاقات عميل معين
   */
  async findByClient(clientId: number) {
    return this.model.findMany({
      where: { clientId },
      include: {
        registrar: true,
        costs: true,
        website: true,
      },
      orderBy: {
        domainName: 'asc',
      },
    });
  }

  /**
   * جلب نطاقات مع التكاليف الشهرية
   */
  async findWithMonthlyCosts() {
    return this.model.findMany({
      include: {
        costs: {
          where: {
            billingCycle: 'monthly',
          },
        },
        client: true,
      },
    });
  }

  /**
   * إحصائيات النطاقات
   */
  async getStats() {
    const [total, byStatus, expiringSoon] = await Promise.all([
      this.count(undefined),
      this.model.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.model.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          status: 'active',
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      expiringSoon,
    };
  }

  /**
   * تحديث حالة النطاقات المنتهية
   */
  async updateExpiredDomains() {
    return this.model.updateMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        status: {
          not: 'expired',
        },
      },
      data: {
        status: 'expired',
      },
    });
  }
}

export const domainRepository = new DomainRepository();
