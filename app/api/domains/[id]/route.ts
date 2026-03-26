import { NextRequest } from 'next/server';
import { domainRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { DomainStatus } from '@prisma/client';

/**
 * GET /api/domains/[id]
 * جلب نطاق معين
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid domain ID', 400);
    }

    const domain = await domainRepository.findByIdWithRelations(id);

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
  domainName: z.string().min(1).optional(),
  tld: z.string().optional().nullable(),
  status: z.nativeEnum(DomainStatus).optional(),
  registrarId: z.number().int().positive().optional().nullable(),
  clientId: z.number().int().positive().optional().nullable(),
  cloudflareAccountId: z.number().int().positive().optional().nullable(),
  registrationDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  autoRenew: z.boolean().optional(),
  renewalNotificationDays: z.number().int().positive().optional(),
  whoisPrivacy: z.boolean().optional(),
  nameservers: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid domain ID', 400);
    }

    const body = await req.json();
    const validatedData = updateDomainSchema.parse(body);

    const existing = await domainRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    const updateData: any = {
      ...validatedData,
      registrationDate: validatedData.registrationDate ? new Date(validatedData.registrationDate) : undefined,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
    };

    if ('registrarId' in validatedData) {
      if (validatedData.registrarId) {
        updateData.registrar = {
          connect: { id: validatedData.registrarId },
        };
      } else {
        updateData.registrar = {
          disconnect: true,
        };
      }
      delete updateData.registrarId;
    }

    if ('clientId' in validatedData) {
      if (validatedData.clientId) {
        updateData.client = {
          connect: { id: validatedData.clientId },
        };
      } else {
        updateData.client = {
          disconnect: true,
        };
      }
      delete updateData.clientId;
    }

    if ('cloudflareAccountId' in validatedData) {
      if (validatedData.cloudflareAccountId) {
        updateData.cloudflareAccount = {
          connect: { id: validatedData.cloudflareAccountId },
        };
      } else {
        updateData.cloudflareAccount = {
          disconnect: true,
        };
      }
      delete updateData.cloudflareAccountId;
    }

    const domain = await domainRepository.update(id, updateData);

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

    if (isNaN(id)) {
      return ApiResponseHelper.error('Invalid domain ID', 400);
    }

    const existing = await domainRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('Domain not found');
    }

    await domainRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
