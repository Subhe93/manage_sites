import { Website, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class WebsiteRepository extends BaseRepository<
  Website,
  Prisma.WebsiteCreateInput,
  Prisma.WebsiteUpdateInput,
  Prisma.WebsiteWhereInput
> {
  protected model = prisma.website;

  /**
   * جلب موقع مع جميع العلاقات
   */
  async findByIdWithRelations(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        domain: true,
        client: true,
        server: true,
        serverAccount: {
          include: {
            server: true,
          },
        },
        credentials: true,
        costs: true,
        repositories: true,
        uptimeChecks: {
          include: {
            logs: {
              take: 10,
              orderBy: {
                checkedAt: 'desc',
              },
            },
          },
        },
        subdomains: true,
      },
    });
  }

  /**
   * جلب مواقع عميل معين
   */
  async findByClient(clientId: number) {
    return this.model.findMany({
      where: { clientId },
      include: {
        domain: true,
        server: true,
        serverAccount: {
          include: {
            server: true,
          },
        },
      },
      orderBy: {
        websiteName: 'asc',
      },
    });
  }

  /**
   * جلب المواقع حسب النوع
   */
  async findByType(websiteType: string) {
    return this.model.findMany({
      where: { websiteType: websiteType as any },
      include: {
        domain: true,
        client: true,
        server: true,
      },
    });
  }

  /**
   * جلب المواقع حسب البيئة
   */
  async findByEnvironment(environment: 'development' | 'staging' | 'production') {
    return this.model.findMany({
      where: { environment },
      include: {
        domain: true,
        client: true,
        server: true,
      },
    });
  }

  /**
   * جلب المواقع النشطة فقط
   */
  async findActive() {
    return this.model.findMany({
      where: { status: 'active' },
      include: {
        domain: true,
        client: true,
        server: true,
        uptimeChecks: {
          where: { isActive: true },
        },
      },
    });
  }

  /**
   * جلب المواقع في وضع الصيانة
   */
  async findInMaintenance() {
    return this.model.findMany({
      where: { status: 'maintenance' },
      include: {
        domain: true,
        client: true,
        server: true,
      },
    });
  }

  /**
   * إحصائيات المواقع
   */
  async getStats() {
    const [total, active, maintenance, suspended, byType] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'active' } }),
      this.model.count({ where: { status: 'maintenance' } }),
      this.model.count({ where: { status: 'suspended' } }),
      this.model.groupBy({
        by: ['websiteType'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      maintenance,
      suspended,
      byType: byType.map((item) => ({
        type: item.websiteType,
        count: item._count,
      })),
    };
  }

  /**
   * البحث في المواقع
   */
  async search(query: string) {
    return this.model.findMany({
      where: {
        OR: [
          { websiteName: { contains: query, mode: 'insensitive' } },
          { websiteUrl: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        domain: true,
        client: true,
        server: true,
      },
    });
  }
}

export const websiteRepository = new WebsiteRepository();
