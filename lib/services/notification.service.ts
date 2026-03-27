import prisma from '@/lib/prisma';

export interface NotificationPayload {
  type: 'uptime_down' | 'uptime_recovery' | 'uptime_degraded';
  websiteId: number;
  websiteName: string;
  url: string;
  status: string;
  responseTime?: number | null;
  errorMessage?: string | null;
  severity: 'info' | 'warning' | 'critical';
}

export class NotificationService {
  static async sendUptimeNotification(payload: NotificationPayload): Promise<void> {
    try {
      const title = this.buildNotificationTitle(payload);
      const message = this.buildNotificationMessage(payload);

      await prisma.notification.create({
        data: {
          notificationType: 'other',
          entityType: 'website',
          entityId: payload.websiteId,
          title,
          message,
          severity: payload.severity,
          isRead: false,
          sentVia: 'in_app',
        },
      });

      console.log(`[Notification] Sent ${payload.type} notification for ${payload.websiteName}`);
    } catch (error) {
      console.error('[Notification] Failed to send notification:', error);
    }
  }

  private static buildNotificationTitle(payload: NotificationPayload): string {
    switch (payload.type) {
      case 'uptime_down':
        return `🔴 Website Down: ${payload.websiteName}`;
      case 'uptime_recovery':
        return `✅ Website Recovered: ${payload.websiteName}`;
      case 'uptime_degraded':
        return `⚠️ Website Degraded: ${payload.websiteName}`;
      default:
        return `Uptime Alert: ${payload.websiteName}`;
    }
  }

  private static buildNotificationMessage(payload: NotificationPayload): string {
    const baseMsg = `URL: ${payload.url}\nStatus: ${payload.status}`;
    
    if (payload.type === 'uptime_down' && payload.errorMessage) {
      return `${baseMsg}\nError: ${payload.errorMessage}`;
    }
    
    if (payload.type === 'uptime_recovery' && payload.responseTime) {
      return `${baseMsg}\nResponse Time: ${payload.responseTime}ms`;
    }
    
    if (payload.type === 'uptime_degraded' && payload.responseTime) {
      return `${baseMsg}\nSlow Response: ${payload.responseTime}ms`;
    }
    
    return baseMsg;
  }

  static async getUnreadNotifications(userId?: number): Promise<any[]> {
    const where = userId ? { sentToUserId: userId, isRead: false } : { isRead: false };
    
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(notificationId: number): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
