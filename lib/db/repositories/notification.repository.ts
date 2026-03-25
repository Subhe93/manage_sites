import { Notification, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class NotificationRepository extends BaseRepository<
  Notification,
  Prisma.NotificationCreateInput,
  Prisma.NotificationUpdateInput,
  Prisma.NotificationWhereInput
> {
  protected model = prisma.notification;

  /**
   * جلب إشعارات مستخدم معين
   */
  async findByUser(userId: number, unreadOnly: boolean = false) {
    return this.model.findMany({
      where: {
        sentToUserId: userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * جلب الإشعارات غير المقروءة
   */
  async findUnread(userId: number) {
    return this.model.findMany({
      where: {
        sentToUserId: userId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * عد الإشعارات غير المقروءة
   */
  async countUnread(userId: number): Promise<number> {
    return this.model.count({
      where: {
        sentToUserId: userId,
        isRead: false,
      },
    });
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(id: number) {
    return this.model.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * تحديد جميع إشعارات المستخدم كمقروءة
   */
  async markAllAsRead(userId: number) {
    return this.model.updateMany({
      where: {
        sentToUserId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * جلب الإشعارات الحرجة
   */
  async findCritical(userId?: number) {
    return this.model.findMany({
      where: {
        severity: 'critical',
        ...(userId && { sentToUserId: userId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * حذف الإشعارات القديمة
   */
  async deleteOld(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.model.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
