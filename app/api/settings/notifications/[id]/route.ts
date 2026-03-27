import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  const setting = await prisma.notificationSettings.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!setting) {
    return ApiResponseHelper.error('Notification setting not found', 404);
  }

  return ApiResponseHelper.success({
    id: setting.id,
    user_id: setting.userId,
    user_name: setting.user.fullName,
    notification_type: setting.notificationType,
    days_before: setting.daysBefore,
    notify_via_email: setting.notifyViaEmail,
    notify_via_sms: setting.notifyViaSms,
    notify_in_app: setting.notifyInApp,
    is_enabled: setting.isEnabled,
  });
});

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);
  const body = await req.json();
  const { daysBefore, notifyViaEmail, notifyViaSms, notifyInApp, isEnabled } = body;

  const setting = await prisma.notificationSettings.update({
    where: { id },
    data: {
      daysBefore,
      notifyViaEmail,
      notifyViaSms,
      notifyInApp,
      isEnabled,
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

  return ApiResponseHelper.success({
    id: setting.id,
    user_id: setting.userId,
    user_name: setting.user.fullName,
    notification_type: setting.notificationType,
    days_before: setting.daysBefore,
    notify_via_email: setting.notifyViaEmail,
    notify_via_sms: setting.notifyViaSms,
    notify_in_app: setting.notifyInApp,
    is_enabled: setting.isEnabled,
  });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  await prisma.notificationSettings.delete({
    where: { id },
  });

  return ApiResponseHelper.success({ message: 'Notification setting deleted successfully' });
});
