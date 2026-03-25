import { NextRequest } from 'next/server';
import { cloudflareAccountRepository } from '@/lib/db/repositories/cloudflare-account.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { CloudflareAccountStatus } from '@prisma/client';
/**
 * GET /api/cloudflare/accounts
 * جلب جميع حسابات Cloudflare مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const filters: any = {};
    if (status && status !== 'all' && status !== 'undefined') {
        filters.status = status as CloudflareAccountStatus;
    }
    if (search && search.trim() !== '' && search !== 'undefined') {
        filters.search = search;
    }
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    const [accounts, total] = await Promise.all([
        cloudflareAccountRepository.findAllWithFilters(filters, page, pageSize, orderBy),
        cloudflareAccountRepository.countWithFilters(filters),
    ]);
    return ApiResponseHelper.successWithPagination(
        accounts,
        {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            hasNext: page < Math.ceil(total / pageSize),
            hasPrev: page > 1,
        }
    );
});
/**
 * POST /api/cloudflare/accounts
 * إنشاء حساب Cloudflare جديد
 */
const createAccountSchema = z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountEmail: z.string().email('Valid email is required'),
    accountId: z.string().optional().nullable(),
    status: z.nativeEnum(CloudflareAccountStatus),
    notes: z.string().optional().nullable(),
});
export const POST = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = createAccountSchema.parse(body);
    const account = await cloudflareAccountRepository.create({
        accountName: validatedData.accountName,
        accountEmail: validatedData.accountEmail,
        accountId: validatedData.accountId,
        status: validatedData.status,
        notes: validatedData.notes,
    });
    return ApiResponseHelper.created(account);
});