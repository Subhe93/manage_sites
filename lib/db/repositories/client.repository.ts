import { Client, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class ClientRepository extends BaseRepository<
  Client,
  Prisma.ClientCreateInput,
  Prisma.ClientUpdateInput,
  Prisma.ClientWhereInput
> {
  protected model = prisma.client;

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
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
    const [total, active, suspended, inactive] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'active' } }),
      this.model.count({ where: { status: 'suspended' } }),
      this.model.count({ where: { status: 'inactive' } }),
    ]);

    return {
      total,
      active,
      suspended,
      inactive,
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
