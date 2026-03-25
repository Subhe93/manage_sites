import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

/**
 * GET /api/domains/[id]
 * جلب نطاق معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    const domain = await domainRepository.findByName(params.id);
    
    if (!domain) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    return ApiResponseHelper.success(domain);
  }
);

/**
 * PUT /api/domains/[id]
 * تحديث نطاق
 */
const updateDomainSchema = z.object({
  domainName: z.string().min(3).max(255).optional(),
  tld: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending', 'suspended', 'deleted']).optional(),
  registrarId: z.number().optional(),
  clientId: z.number().optional(),
  registrationDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  autoRenew: z.boolean().optional(),
  renewalNotificationDays: z.number().optional(),
  whoisPrivacy: z.boolean().optional(),
  nameservers: z.string().optional(),
  notes: z.string().optional(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = updateDomainSchema.parse(body);

    // التحقق من وجود النطاق
    const existing = await domainRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    const domain = await domainRepository.update(id, {
      ...validatedData,
      registrationDate: validatedData.registrationDate
        ? new Date(validatedData.registrationDate)
        : undefined,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
      registrar: validatedData.registrarId
        ? { connect: { id: validatedData.registrarId } }
        : undefined,
      client: validatedData.clientId ? { connect: { id: validatedData.clientId } } : undefined,
    } as any);

    return ApiResponseHelper.success(domain);
  }
);

/**
 * DELETE /api/domains/[id]
 * حذف نطاق
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    // التحقق من وجود النطاق
    const existing = await domainRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    await domainRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
