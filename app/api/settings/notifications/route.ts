import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const where = userId ? { userId: parseInt(userId) } : {};

  const settings = await prisma.notificationSettings.findMany({
    where,
    orderBy: { notificationType: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  const formattedSettings = settings.map((setting) => ({
    id: setting.id,
    user_id: setting.userId,
    user_name: setting.user.fullName,
    notification_type: setting.notificationType,
    days_before: setting.daysBefore,
    notify_via_email: setting.notifyViaEmail,
    notify_via_sms: setting.notifyViaSms,
    notify_in_app: setting.notifyInApp,
    is_enabled: setting.isEnabled,
  }));

  return ApiResponseHelper.success(formattedSettings);
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const {
    userId,
    notificationType,
    daysBefore,
    notifyViaEmail,
    notifyViaSms,
    notifyInApp,
    isEnabled,
  } = body;

  const setting = await prisma.notificationSettings.create({
    data: {
      userId,
      notificationType,
      daysBefore: daysBefore ?? 30,
      notifyViaEmail: notifyViaEmail ?? true,
      notifyViaSms: notifyViaSms ?? false,
      notifyInApp: notifyInApp ?? true,
      isEnabled: isEnabled ?? true,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return ApiResponseHelper.success(
    {
      id: setting.id,
      user_id: setting.userId,
      user_name: setting.user.fullName,
      notification_type: setting.notificationType,
      days_before: setting.daysBefore,
      notify_via_email: setting.notifyViaEmail,
      notify_via_sms: setting.notifyViaSms,
      notify_in_app: setting.notifyInApp,
      is_enabled: setting.isEnabled,
    },
    201
  );
});
