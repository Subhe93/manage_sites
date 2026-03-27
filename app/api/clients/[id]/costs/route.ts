import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle, CostType } from '@prisma/client';

const createCostSchema = z.object({
  costAmount: z.number().positive('Cost amount must be positive'),
  currency: z.string().default('USD'),
  billingCycle: z.nativeEnum(BillingCycle),
  costType: z.nativeEnum(CostType),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  autoRenew: z.boolean().default(true),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id);
    if (isNaN(clientId)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const costs = await (prisma as any).clientCost.findMany({
      where: { clientId },
      orderBy: { nextBillingDate: 'asc' },
    });

    return ApiResponseHelper.success(costs);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id);
    if (isNaN(clientId)) {
      return ApiResponseHelper.error('Invalid client ID', 400);
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return ApiResponseHelper.error('Client not found', 404);
    }

    const body = await request.json();
    const data = createCostSchema.parse(body);

    const cost = await (prisma as any).clientCost.create({
      data: {
        clientId,
        costAmount: data.costAmount,
        currency: data.currency,
        billingCycle: data.billingCycle,
        costType: data.costType,
        description: data.description || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
        autoRenew: data.autoRenew,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
      },
    });

    return ApiResponseHelper.success(cost, 201);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
