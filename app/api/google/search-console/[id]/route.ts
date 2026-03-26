import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { CloudflareAccountStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export const GET = asyncHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return ApiResponseHelper.error('Invalid account ID', 400);
  }

  const account = await prisma.googleSearchConsoleAccount.findUnique({ where: { id } });

  if (!account) {
    return ApiResponseHelper.notFound('Google Search Console account not found');
  }

  return ApiResponseHelper.success(account);
});

const updateGoogleSearchConsoleAccountSchema = z.object({
  accountName: z.string().min(1).optional(),
  accountEmail: z.string().min(1).optional(),
  status: z.nativeEnum(CloudflareAccountStatus).optional(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return ApiResponseHelper.error('Invalid account ID', 400);
  }

  const existing = await prisma.googleSearchConsoleAccount.findUnique({ where: { id } });
  if (!existing) {
    return ApiResponseHelper.notFound('Google Search Console account not found');
  }

  const body = await req.json();
  const validatedData = updateGoogleSearchConsoleAccountSchema.parse(body);

  const account = await prisma.googleSearchConsoleAccount.update({
    where: { id },
    data: validatedData,
  });

  return ApiResponseHelper.success(account);
});

export const DELETE = asyncHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return ApiResponseHelper.error('Invalid account ID', 400);
  }

  const existing = await prisma.googleSearchConsoleAccount.findUnique({ where: { id } });
  if (!existing) {
    return ApiResponseHelper.notFound('Google Search Console account not found');
  }

  await prisma.googleSearchConsoleAccount.delete({ where: { id } });

  return ApiResponseHelper.noContent();
});
