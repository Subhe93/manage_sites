import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { UptimeSchedulerService } from '@/lib/services/uptime-scheduler.service';

export const GET = asyncHandler(async (req: NextRequest) => {
  const settings = await prisma.uptimeMonitorSettings.findFirst({
    orderBy: { id: 'desc' },
  });

  if (!settings) {
    const defaultSettings = await prisma.uptimeMonitorSettings.create({
      data: {
        isEnabled: false,
        checkIntervalMinutes: 5,
        enableNotifications: true,
        notifyOnDown: true,
        notifyOnRecovery: true,
        notifyOnDegraded: false,
        consecutiveFailsBeforeAlert: 2,
        timeoutSeconds: 10,
        maxConcurrentChecks: 5,
      },
    });

    return ApiResponseHelper.success(defaultSettings);
  }

  return ApiResponseHelper.success(settings);
});

export const PUT = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const {
    isEnabled,
    checkIntervalMinutes,
    enableNotifications,
    notifyOnDown,
    notifyOnRecovery,
    notifyOnDegraded,
    notificationEmails,
    consecutiveFailsBeforeAlert,
    timeoutSeconds,
    maxConcurrentChecks,
    checkSubdomains,
    degradedThresholdMs,
    logRetentionDays,
  } = body;

  const existingSettings = await prisma.uptimeMonitorSettings.findFirst({
    orderBy: { id: 'desc' },
  });

  let settings;

  if (existingSettings) {
    settings = await prisma.uptimeMonitorSettings.update({
      where: { id: existingSettings.id },
      data: {
        isEnabled,
        checkIntervalMinutes,
        enableNotifications,
        notifyOnDown,
        notifyOnRecovery,
        notifyOnDegraded,
        notificationEmails,
        consecutiveFailsBeforeAlert,
        timeoutSeconds,
        maxConcurrentChecks,
        checkSubdomains,
        degradedThresholdMs,
        logRetentionDays,
      },
    });
  } else {
    settings = await prisma.uptimeMonitorSettings.create({
      data: {
        isEnabled,
        checkIntervalMinutes,
        enableNotifications,
        notifyOnDown,
        notifyOnRecovery,
        notifyOnDegraded,
        notificationEmails,
        consecutiveFailsBeforeAlert,
        timeoutSeconds,
        maxConcurrentChecks,
        checkSubdomains,
        degradedThresholdMs,
        logRetentionDays,
      },
    });
  }

  await UptimeSchedulerService.restart();

  return ApiResponseHelper.success(settings, 200, {
    message: 'Uptime monitor settings updated successfully',
  });
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const { action } = await req.json();

  if (action === 'run_manual_check') {
    await UptimeSchedulerService.runManualCheck();
    return ApiResponseHelper.success({ message: 'Manual check started' });
  }

  if (action === 'get_status') {
    const status = UptimeSchedulerService.getStatus();
    return ApiResponseHelper.success(status);
  }

  if (action === 'cleanup_logs') {
    await UptimeSchedulerService.cleanupOldLogs();
    return ApiResponseHelper.success({ message: 'Old logs cleaned up successfully' });
  }

  return ApiResponseHelper.error('Invalid action', 400);
});
