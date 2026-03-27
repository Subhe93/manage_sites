import * as cron from 'node-cron';
import { UptimeCheckerService } from './uptime-checker.service';
import prisma from '@/lib/prisma';

export class UptimeSchedulerService {
  private static cronTask: cron.ScheduledTask | null = null;
  private static currentInterval: number | null = null;

  static async initialize(): Promise<void> {
    console.log('[UptimeScheduler] Initializing uptime monitoring scheduler...');
    
    try {
      const settings = await this.getSettings();
      
      if (settings && settings.isEnabled) {
        await this.start(settings.checkIntervalMinutes);
        console.log(`[UptimeScheduler] Started with interval: ${settings.checkIntervalMinutes} minutes`);
      } else {
        console.log('[UptimeScheduler] Monitoring is disabled');
      }
    } catch (error) {
      console.error('[UptimeScheduler] Failed to initialize:', error);
    }
  }

  static async start(intervalMinutes: number): Promise<void> {
    this.stop();

    const cronExpression = this.getCronExpression(intervalMinutes);
    
    this.cronTask = cron.schedule(cronExpression, async () => {
      console.log(`[UptimeScheduler] Running scheduled check (interval: ${intervalMinutes}m)`);
      await UptimeCheckerService.runAutomaticCheck();
    });

    this.currentInterval = intervalMinutes;
    console.log(`[UptimeScheduler] Cron scheduled: ${cronExpression}`);
  }

  static stop(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      this.currentInterval = null;
      console.log('[UptimeScheduler] Stopped');
    }
  }

  static async restart(): Promise<void> {
    console.log('[UptimeScheduler] Restarting...');
    const settings = await this.getSettings();
    
    if (settings && settings.isEnabled) {
      await this.start(settings.checkIntervalMinutes);
    } else {
      this.stop();
    }
  }

  static getStatus(): { running: boolean; interval: number | null } {
    return {
      running: this.cronTask !== null,
      interval: this.currentInterval,
    };
  }

  private static getCronExpression(intervalMinutes: number): string {
    switch (intervalMinutes) {
      case 1:
        return '* * * * *';
      case 5:
        return '*/5 * * * *';
      case 10:
        return '*/10 * * * *';
      case 15:
        return '*/15 * * * *';
      case 30:
        return '*/30 * * * *';
      case 60:
        return '0 * * * *';
      default:
        return `*/${intervalMinutes} * * * *`;
    }
  }

  private static async getSettings() {
    return prisma.uptimeMonitorSettings.findFirst({
      orderBy: { id: 'desc' },
    });
  }

  static async runManualCheck(): Promise<void> {
    console.log('[UptimeScheduler] Running manual check...');
    await UptimeCheckerService.runAutomaticCheck();
  }
}
