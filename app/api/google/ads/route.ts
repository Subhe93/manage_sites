import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { CloudflareAccountStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export const GET = asyncHandler(async () => {
  const accounts = await prisma.googleAdsAccount.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return ApiResponseHelper.success(accounts);
});

const createGoogleAdsAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountEmail: z.string().min(1, 'Account email is required'),
  customerId: z.string().optional().nullable(),
  status: z.nativeEnum(CloudflareAccountStatus),
  notes: z.string().optional().nullable(),
});

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = createGoogleAdsAccountSchema.parse(body);

  const account = await prisma.googleAdsAccount.create({
    data: {
      accountName: validatedData.accountName,
      accountEmail: validatedData.accountEmail,
      customerId: validatedData.customerId,
      status: validatedData.status,
      notes: validatedData.notes,
    },
  });

  return ApiResponseHelper.created(account);
});
