import { Server, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class ServerRepository extends BaseRepository<
  Server,
  Prisma.ServerCreateInput,
  Prisma.ServerUpdateInput,
  Prisma.ServerWhereInput
> {
  protected model = prisma.server;

  /**
   * جلب خادم مع جميع العلاقات
   */
  async findByIdWithRelations(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        provider: true,
        accounts: {
          include: {
            websites: true,
          },
        },
        costs: true,
        monitoring: {
          take: 30,
          orderBy: {
            recordedAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * جلب الخوادم النشطة
   */
  async findActive() {
    return this.model.findMany({
      where: { status: 'active' },
      include: {
        provider: true,
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });
  }

  /**
   * جلب الخوادم في وضع الصيانة
   */
  async findInMaintenance() {
    return this.model.findMany({
      where: { status: 'maintenance' },
      include: {
        provider: true,
      },
    });
  }

  /**
   * جلب آخر بيانات المراقبة للخوادم
   */
  async findWithLatestMonitoring() {
    const servers = await this.model.findMany({
      where: { status: 'active' },
      include: {
        monitoring: {
          take: 1,
          orderBy: {
            recordedAt: 'desc',
          },
        },
      },
    });

    return servers.map((server) => ({
      ...server,
      latestMonitoring: server.monitoring[0] || null,
    }));
  }

  /**
   * إحصائيات الخوادم
   */
  async getStats() {
    const [total, active, maintenance, suspended, byType] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'active' } }),
      this.model.count({ where: { status: 'maintenance' } }),
      this.model.count({ where: { status: 'suspended' } }),
      this.model.groupBy({
        by: ['serverType'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      maintenance,
      suspended,
      byType: byType.map((item) => ({
        type: item.serverType,
        count: item._count,
      })),
    };
  }

  /**
   * جلب الخوادم حسب الموقع الجغرافي
   */
  async findByLocation(location: string) {
    return this.model.findMany({
      where: {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      },
      include: {
        provider: true,
      },
    });
  }
}

export const serverRepository = new ServerRepository();
