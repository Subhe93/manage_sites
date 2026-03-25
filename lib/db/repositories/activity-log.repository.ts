import { ActivityLog, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class ActivityLogRepository extends BaseRepository<
  ActivityLog,
  Prisma.ActivityLogCreateInput,
  Prisma.ActivityLogUpdateInput,
  Prisma.ActivityLogWhereInput
> {
  protected model = prisma.activityLog;

  /**
   * جلب سجلات نشاط مستخدم معين
   */
  async findByUser(userId: number, limit: number = 50) {
    return this.model.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * جلب سجلات نشاط كيان معين
   */
  async findByEntity(entityType: string, entityId: number) {
    return this.model.findMany({
      where: {
        entityType: entityType as any,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * جلب آخر الأنشطة
   */
  async findRecent(limit: number = 100) {
    return this.model.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * جلب الأنشطة حسب النوع
   */
  async findByActionType(actionType: string, limit: number = 50) {
    return this.model.findMany({
      where: {
        actionType: actionType as any,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * جلب الأنشطة في فترة زمنية
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * تسجيل نشاط جديد
   */
  async log(data: {
    userId?: number;
    actionType: string;
    entityType: string;
    entityId?: number;
    entityName?: string;
    description?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.model.create({
      data: {
        ...data,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      } as any,
    });
  }

  /**
   * حذف السجلات القديمة
   */
  async deleteOld(daysOld: number = 180) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.model.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}

export const activityLogRepository = new ActivityLogRepository();
