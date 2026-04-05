import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const PATCH = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const websiteId = parseInt(params.id, 10);
  if (isNaN(websiteId)) {
    return ApiResponseHelper.error('Invalid website ID', 400);
  }

  const body = await req.json();
  const { checkSubdomains } = body;

  if (typeof checkSubdomains !== 'boolean') {
    return ApiResponseHelper.error('checkSubdomains must be a boolean', 400);
  }

  const website = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!website) {
    return ApiResponseHelper.error('Website not found', 404);
  }

  const updated = await prisma.website.update({
    where: { id: websiteId },
    data: { checkSubdomains },
    select: { id: true, websiteName: true, checkSubdomains: true },
  });

  return ApiResponseHelper.success(updated, 200, {
    message: `Subdomain checking ${checkSubdomains ? 'enabled' : 'disabled'} for ${updated.websiteName}`,
  });
});
