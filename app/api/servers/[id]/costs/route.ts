import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { BillingCycle } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * GET /api/servers/[id]/costs
 * Get costs for a server
 */
export const GET = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const serverId = parseInt(params.id);

    if (isNaN(serverId)) {
      return ApiResponseHelper.error('Invalid server ID', 400);
    }

    const costs = await prisma.serverCost.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success(costs);
  }
);

const createCostSchema = z.object({
  costAmount: z.number().positive('Cost amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  billingCycle: z.nativeEnum(BillingCycle),
  activationDate: z.string().optional().nullable(),
  nextBillingDate: z.string().optional().nullable(),
  autoRenew: z.boolean().optional().default(true),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * POST /api/servers/[id]/costs
 * Add new cost for a server
 */
export const POST = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const serverId = parseInt(params.id);

    if (isNaN(serverId)) {
      return ApiResponseHelper.error('Invalid server ID', 400);
    }

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return ApiResponseHelper.notFound('Server not found');
    }

    const body = await req.json();
    const validatedData = createCostSchema.parse(body);

    const cost = await prisma.serverCost.create({
      data: {
        serverId,
        costAmount: validatedData.costAmount,
        currency: validatedData.currency,
        billingCycle: validatedData.billingCycle,
        activationDate: validatedData.activationDate ? new Date(validatedData.activationDate) : null,
        nextBillingDate: validatedData.nextBillingDate ? new Date(validatedData.nextBillingDate) : null,
        autoRenew: validatedData.autoRenew,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
      },
    });

    return ApiResponseHelper.created(cost);
  }
);
