import { Domain, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class DomainRepository extends BaseRepository<
  Domain,
  Prisma.DomainCreateInput,
  Prisma.DomainUpdateInput,
  Prisma.DomainWhereInput
> {
  protected model = prisma.domain;

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
        websites: true,
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
    const [total, active, expired, expiringSoon] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'active' } }),
      this.model.count({ where: { status: 'expired' } }),
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
      active,
      expired,
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
