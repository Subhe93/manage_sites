import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle, CostType } from '@prisma/client';

const updateCostSchema = z.object({
  costAmount: z.number().positive().optional(),
  currency: z.string().optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  costType: z.nativeEnum(CostType).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  autoRenew: z.boolean().optional(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; costId: string } }
) {
  try {
    const clientId = parseInt(params.id);
    const costId = parseInt(params.costId);
    if (isNaN(clientId) || isNaN(costId)) {
      return ApiResponseHelper.error('Invalid ID', 400);
    }

    const existing = await (prisma as any).clientCost.findFirst({
      where: { id: costId, clientId },
    });
    if (!existing) {
      return ApiResponseHelper.error('Cost not found', 404);
    }

    const body = await request.json();
    const data = updateCostSchema.parse(body);

    const updateData: any = { ...data };
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.nextBillingDate !== undefined) {
      updateData.nextBillingDate = data.nextBillingDate ? new Date(data.nextBillingDate) : null;
    }

    const cost = await (prisma as any).clientCost.update({
      where: { id: costId },
      data: updateData,
    });

    return ApiResponseHelper.success(cost);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; costId: string } }
) {
  try {
    const clientId = parseInt(params.id);
    const costId = parseInt(params.costId);
    if (isNaN(clientId) || isNaN(costId)) {
      return ApiResponseHelper.error('Invalid ID', 400);
    }

    const existing = await (prisma as any).clientCost.findFirst({
      where: { id: costId, clientId },
    });
    if (!existing) {
      return ApiResponseHelper.error('Cost not found', 404);
    }

    await (prisma as any).clientCost.delete({ where: { id: costId } });

    return ApiResponseHelper.success({ message: 'Cost deleted' });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
