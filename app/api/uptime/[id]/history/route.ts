import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const websiteId = parseInt(params.id);
  if (isNaN(websiteId)) {
    return ApiResponseHelper.error('Invalid website ID', 400);
  }

  const hours = parseInt(req.nextUrl.searchParams.get('hours') || '24');
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
    },
  });

  if (!website) {
    return ApiResponseHelper.notFound('Website not found');
  }

  const checks = await prisma.uptimeCheck.findMany({
    where: { websiteId, isActive: true },
    select: {
      id: true,
      checkUrl: true,
      lastStatus: true,
      lastCheckAt: true,
      logs: {
        where: { checkedAt: { gte: since } },
        orderBy: { checkedAt: 'asc' },
        select: {
          id: true,
          status: true,
          responseTimeMs: true,
          statusCode: true,
          errorMessage: true,
          checkedAt: true,
        },
      },
    },
  });

  const endpoints = checks.map((check) => {
    const logs = check.logs;
    const totalLogs = logs.length;
    const upCount = logs.filter((l) => l.status === 'up').length;
    const downCount = logs.filter((l) => l.status === 'down').length;
    const degradedCount = logs.filter((l) => l.status === 'degraded').length;

    const uptimePercentage = totalLogs > 0
      ? Math.round((upCount / totalLogs) * 10000) / 100
      : null;

    const responseTimes = logs
      .map((l) => l.responseTimeMs)
      .filter((v): v is number => v !== null);

    const avgResponseTimeMs = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length)
      : null;

    const minResponseTimeMs = responseTimes.length > 0
      ? Math.min(...responseTimes)
      : null;

    const maxResponseTimeMs = responseTimes.length > 0
      ? Math.max(...responseTimes)
      : null;

    // Build response time timeline (group by hour)
    const hourlyBuckets: Record<string, { up: number; down: number; degraded: number; responseTimes: number[] }> = {};
    for (const log of logs) {
      const hour = new Date(log.checkedAt).toISOString().slice(0, 13) + ':00:00.000Z';
      if (!hourlyBuckets[hour]) {
        hourlyBuckets[hour] = { up: 0, down: 0, degraded: 0, responseTimes: [] };
      }
      hourlyBuckets[hour][log.status as 'up' | 'down' | 'degraded']++;
      if (log.responseTimeMs !== null) {
        hourlyBuckets[hour].responseTimes.push(log.responseTimeMs);
      }
    }

    const timeline = Object.entries(hourlyBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, data]) => ({
        hour,
        up: data.up,
        down: data.down,
        degraded: data.degraded,
        total: data.up + data.down + data.degraded,
        avgResponseTimeMs: data.responseTimes.length > 0
          ? Math.round(data.responseTimes.reduce((s, v) => s + v, 0) / data.responseTimes.length)
          : null,
      }));

    // Recent incidents (last N downtime events)
    const incidents = logs
      .filter((l) => l.status === 'down')
      .slice(-20)
      .map((l) => ({
        checkedAt: l.checkedAt.toISOString(),
        statusCode: l.statusCode,
        errorMessage: l.errorMessage,
        responseTimeMs: l.responseTimeMs,
      }));

    return {
      checkId: check.id,
      checkUrl: check.checkUrl,
      lastStatus: check.lastStatus,
      lastCheckAt: check.lastCheckAt?.toISOString() ?? null,
      stats: {
        totalChecks: totalLogs,
        upCount,
        downCount,
        degradedCount,
        uptimePercentage,
        avgResponseTimeMs,
        minResponseTimeMs,
        maxResponseTimeMs,
      },
      timeline,
      recentIncidents: incidents,
    };
  });

  // Overall website stats
  const allLogs = checks.flatMap((c) => c.logs);
  const totalLogs = allLogs.length;
  const upTotal = allLogs.filter((l) => l.status === 'up').length;
  const overallUptime = totalLogs > 0
    ? Math.round((upTotal / totalLogs) * 10000) / 100
    : null;

  return ApiResponseHelper.success({
    website: {
      id: website.id,
      name: website.websiteName,
      url: website.websiteUrl,
    },
    period: {
      hours,
      since: since.toISOString(),
      until: new Date().toISOString(),
    },
    overallUptimePercentage: overallUptime,
    endpoints,
  });
});
