import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * GET /api/domains/[id]/costs
 * جلب تكاليف نطاق معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const domainId = parseInt(params.id);

    if (isNaN(domainId)) {
      return ApiResponseHelper.error('Invalid domain ID', 400);
    }

    const costs = await prisma.domainCost.findMany({
      where: { domainId },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success(costs);
  }
);

/**
 * POST /api/domains/[id]/costs
 * إضافة تكلفة جديدة لنطاق
 */
const createCostSchema = z.object({
  costAmount: z.number().positive('Cost amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  billingCycle: z.nativeEnum(BillingCycle),
  purchaseDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const POST = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const domainId = parseInt(params.id);

    if (isNaN(domainId)) {
      return ApiResponseHelper.error('Invalid domain ID', 400);
    }

    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    const body = await req.json();
    const validatedData = createCostSchema.parse(body);

    const cost = await prisma.domainCost.create({
      data: {
        domainId,
        costAmount: validatedData.costAmount,
        currency: validatedData.currency,
        billingCycle: validatedData.billingCycle,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        nextBillingDate: validatedData.nextBillingDate ? new Date(validatedData.nextBillingDate) : null,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
      },
    });

    return ApiResponseHelper.created(cost);
  }
);
