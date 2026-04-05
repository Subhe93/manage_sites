import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const websiteId = parseInt(params.id, 10);
  if (isNaN(websiteId)) {
    return ApiResponseHelper.error('Invalid website ID', 400);
  }

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      adminUrl: true,
      apiEndpoint: true,
      websiteType: true,
      framework: true,
      environment: true,
      databaseName: true,
      databaseType: true,
      status: true,
      description: true,
      notes: true,
      domain: {
        select: {
          domainName: true,
          registrar: true,
          expiryDate: true,
        },
      },
      client: {
        select: {
          clientName: true,
          companyName: true,
          email: true,
          phone: true,
        },
      },
      server: {
        select: {
          serverName: true,
          ipAddress: true,
          serverType: true,
          operatingSystem: true,
          controlPanel: true,
          controlPanelUrl: true,
          location: true,
          provider: {
            select: {
              providerName: true,
            },
          },
        },
      },
      serverAccount: {
        select: {
          accountName: true,
          username: true,
          accessLevel: true,
          controlPanelUrl: true,
          sshPort: true,
          ftpPort: true,
        },
      },
      credentials: {
        select: {
          id: true,
          credentialType: true,
          username: true,
          passwordEncrypted: true,
          accessUrl: true,
          additionalInfo: true,
          notes: true,
        },
        orderBy: { credentialType: 'asc' },
      },
      subdomains: {
        select: {
          subdomainName: true,
          fullUrl: true,
          websiteType: true,
          framework: true,
          adminUrl: true,
          adminUsername: true,
          adminPassword: true,
        },
      },
    },
  });

  if (!website) {
    return ApiResponseHelper.error('Website not found', 404);
  }

  return ApiResponseHelper.success(website);
});
