import { NextRequest } from 'next/server';
import { cloudflareDomainRepository } from '@/lib/db/repositories/cloudflare-domain.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { SSLMode, CacheLevel, SecurityLevel } from '@prisma/client';
/**
 * GET /api/cloudflare/domains/[id]
 * جلب نطاق Cloudflare معين
 */
export const GET = asyncHandler(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return ApiResponseHelper.error('Invalid domain ID', 400);
        }
        const cfDomain = await cloudflareDomainRepository.findByIdWithRelations(id);
        if (!cfDomain) {
            return ApiResponseHelper.notFound('Cloudflare domain not found');
        }
        return ApiResponseHelper.success(cfDomain);
    }
);
/**
 * PUT /api/cloudflare/domains/[id]
 * تحديث نطاق Cloudflare
 */
const updateDomainSchema = z.object({
    domainId: z.number().int().positive().optional(),
    cloudflareAccountId: z.number().int().positive().optional(),
    zoneId: z.string().optional().nullable(),
    nameservers: z.string().optional().nullable(),
    sslMode: z.nativeEnum(SSLMode).optional(),
    cacheLevel: z.nativeEnum(CacheLevel).optional(),
    securityLevel: z.nativeEnum(SecurityLevel).optional(),
    isActive: z.boolean().optional(),
    activatedAt: z.string().optional().nullable(),
});
export const PUT = asyncHandler(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return ApiResponseHelper.error('Invalid domain ID', 400);
        }
        const body = await req.json();
        const validatedData = updateDomainSchema.parse(body);
        const existing = await cloudflareDomainRepository.findById(id);
        if (!existing) {
            return ApiResponseHelper.notFound('Cloudflare domain not found');
        }
        const updateData: any = {
            zoneId: validatedData.zoneId,
            nameservers: validatedData.nameservers,
            sslMode: validatedData.sslMode,
            cacheLevel: validatedData.cacheLevel,
            securityLevel: validatedData.securityLevel,
            isActive: validatedData.isActive,
        };
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) delete updateData[key];
        });
        if (validatedData.activatedAt) {
            updateData.activatedAt = new Date(validatedData.activatedAt);
        }
        if (validatedData.domainId) {
            updateData.domain = { connect: { id: validatedData.domainId } };
        }
        if (validatedData.cloudflareAccountId) {
            updateData.cloudflareAccount = { connect: { id: validatedData.cloudflareAccountId } };
        }
        const cfDomain = await cloudflareDomainRepository.update(id, updateData);
        return ApiResponseHelper.success(cfDomain);
    }
);
/**
 * DELETE /api/cloudflare/domains/[id]
 * حذف نطاق Cloudflare
 */
export const DELETE = asyncHandler(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return ApiResponseHelper.error('Invalid domain ID', 400);
        }
        const existing = await cloudflareDomainRepository.findById(id);
        if (!existing) {
            return ApiResponseHelper.notFound('Cloudflare domain not found');
        }
        await cloudflareDomainRepository.delete(id);
        return ApiResponseHelper.noContent();
    }
);