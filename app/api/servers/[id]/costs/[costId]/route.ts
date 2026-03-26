import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle } from '@prisma/client';
import prisma from '@/lib/prisma';

const updateCostSchema = z.object({
  costAmount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  activationDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  autoRenew: z.boolean().optional(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * PUT /api/servers/[id]/costs/[costId]
 * Update server cost
 */
export const PUT = asyncHandler(
  async (req: Request, { params }: { params: { id: string; costId: string } }) => {
    const costId = parseInt(params.costId);

    if (isNaN(costId)) {
      return ApiResponseHelper.error('Invalid cost ID', 400);
    }

    const existing = await prisma.serverCost.findUnique({ where: { id: costId } });
    if (!existing) {
      return ApiResponseHelper.notFound('Cost not found');
    }

    const body = await req.json();
    const validatedData = updateCostSchema.parse(body);

    const updateData: any = { ...validatedData };
    if (validatedData.activationDate !== undefined) {
      updateData.activationDate = validatedData.activationDate
        ? new Date(validatedData.activationDate)
        : null;
    }
    if (validatedData.nextBillingDate !== undefined) {
      updateData.nextBillingDate = validatedData.nextBillingDate
        ? new Date(validatedData.nextBillingDate)
        : null;
    }

    const cost = await prisma.serverCost.update({
      where: { id: costId },
      data: updateData,
    });

    return ApiResponseHelper.success(cost);
  }
);

/**
 * DELETE /api/servers/[id]/costs/[costId]
 * Delete server cost
 */
export const DELETE = asyncHandler(
  async (req: Request, { params }: { params: { id: string; costId: string } }) => {
    const costId = parseInt(params.costId);

    if (isNaN(costId)) {
      return ApiResponseHelper.error('Invalid cost ID', 400);
    }

    const existing = await prisma.serverCost.findUnique({ where: { id: costId } });
    if (!existing) {
      return ApiResponseHelper.notFound('Cost not found');
    }

    await prisma.serverCost.delete({ where: { id: costId } });

    return ApiResponseHelper.noContent();
  }
);
