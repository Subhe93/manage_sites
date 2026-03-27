import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  const setting = await prisma.systemSettings.findUnique({
    where: { id },
    include: {
      updater: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!setting) {
    return ApiResponseHelper.error('Setting not found', 404);
  }

  return ApiResponseHelper.success({
    id: setting.id,
    setting_key: setting.settingKey,
    setting_value: setting.settingValue,
    setting_type: setting.settingType,
    description: setting.description,
    is_public: setting.isPublic,
    updated_by: setting.updatedBy,
    updater_name: setting.updater?.fullName || 'System',
    created_at: setting.createdAt.toISOString(),
    updated_at: setting.updatedAt.toISOString(),
  });
});

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);
  const body = await req.json();
  const { settingValue, description, isPublic, updatedBy } = body;

  const setting = await prisma.systemSettings.update({
    where: { id },
    data: {
      settingValue,
      description,
      isPublic,
      updatedBy,
    },
    include: {
      updater: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return ApiResponseHelper.success({
    id: setting.id,
    setting_key: setting.settingKey,
    setting_value: setting.settingValue,
    setting_type: setting.settingType,
    description: setting.description,
    is_public: setting.isPublic,
    updated_by: setting.updatedBy,
    updater_name: setting.updater?.fullName || 'System',
    created_at: setting.createdAt.toISOString(),
    updated_at: setting.updatedAt.toISOString(),
  });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  await prisma.systemSettings.delete({
    where: { id },
  });

  return ApiResponseHelper.success({ message: 'Setting deleted successfully' });
});
