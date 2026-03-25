import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * PUT /api/domains/[id]/costs/[costId]
 * تحديث تكلفة نطاق
 */
const updateCostSchema = z.object({
  costAmount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  purchaseDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string; costId: string } }) => {
    const costId = parseInt(params.costId);

    if (isNaN(costId)) {
      return ApiResponseHelper.error('Invalid cost ID', 400);
    }

    const existing = await prisma.domainCost.findUnique({ where: { id: costId } });
    if (!existing) {
      return ApiResponseHelper.notFound('Cost not found');
    }

    const body = await req.json();
    const validatedData = updateCostSchema.parse(body);

    const updateData: any = { ...validatedData };
    if (validatedData.purchaseDate !== undefined) {
      updateData.purchaseDate = validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null;
    }
    if (validatedData.nextBillingDate !== undefined) {
      updateData.nextBillingDate = validatedData.nextBillingDate ? new Date(validatedData.nextBillingDate) : null;
    }

    const cost = await prisma.domainCost.update({
      where: { id: costId },
      data: updateData,
    });

    return ApiResponseHelper.success(cost);
  }
);

/**
 * DELETE /api/domains/[id]/costs/[costId]
 * حذف تكلفة نطاق
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string; costId: string } }) => {
    const costId = parseInt(params.costId);

    if (isNaN(costId)) {
      return ApiResponseHelper.error('Invalid cost ID', 400);
    }

    const existing = await prisma.domainCost.findUnique({ where: { id: costId } });
    if (!existing) {
      return ApiResponseHelper.notFound('Cost not found');
    }

    await prisma.domainCost.delete({ where: { id: costId } });

    return ApiResponseHelper.noContent();
  }
);
