import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    const [
      cloudflareAccounts,
      serverNames,
      serverIps,
      providers,
      serverTypes,
      googleAnalytics,
      googleSearchConsole,
      googleAds,
      tagManagers,
    ] = await Promise.all([
      prisma.cloudflareAccount.findMany({
        select: { accountName: true },
        orderBy: { accountName: 'asc' },
      }),
      prisma.server.findMany({
        select: { serverName: true },
        orderBy: { serverName: 'asc' },
      }),
      prisma.server.findMany({
        where: { ipAddress: { not: null } },
        select: { ipAddress: true },
        orderBy: { ipAddress: 'asc' },
      }),
      prisma.serviceProvider.findMany({
        select: { providerName: true },
        orderBy: { providerName: 'asc' },
      }),
      prisma.server.findMany({
        select: { serverType: true },
        distinct: ['serverType'],
      }),
      prisma.googleAnalyticsAccount.findMany({
        select: { accountName: true },
        orderBy: { accountName: 'asc' },
      }),
      prisma.googleSearchConsoleAccount.findMany({
        select: { accountName: true },
        orderBy: { accountName: 'asc' },
      }),
      prisma.googleAdsAccount.findMany({
        select: { accountName: true },
        orderBy: { accountName: 'asc' },
      }),
      prisma.googleTagManagerAccount.findMany({
        select: { accountName: true },
        orderBy: { accountName: 'asc' },
      }),
    ]);

    return ApiResponseHelper.success({
      cloudflareAccount: cloudflareAccounts.map((a) => a.accountName),
      serverName: serverNames.map((s) => s.serverName),
      serverIp: serverIps.map((s) => s.ipAddress).filter(Boolean),
      serverProvider: providers.map((p) => p.providerName),
      serverType: serverTypes.map((s) => s.serverType),
      googleAnalytics: googleAnalytics.map((a) => a.accountName),
      googleSearchConsole: googleSearchConsole.map((a) => a.accountName),
      googleAds: googleAds.map((a) => a.accountName),
      tagManager: tagManagers.map((a) => a.accountName),
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
