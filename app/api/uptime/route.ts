import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

type EndpointType = 'primary' | 'subdomain' | 'api';
type MonitorStatus = 'up' | 'down' | 'degraded';

interface EndpointTarget {
  type: EndpointType;
  label: string;
  url: string;
}

interface EndpointResult extends EndpointTarget {
  status: MonitorStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

interface EndpointResponse extends EndpointResult {
  checkId: number | null;
  uptimePercentage24h: number | null;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const limit = Math.max(1, Math.min(concurrency, items.length));

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        break;
      }

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(Array.from({ length: limit }, () => worker()));

  return results;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function classifyStatus(statusCode: number | null, responseTimeMs: number | null, errorMessage: string | null): MonitorStatus {
  if (errorMessage || !statusCode) return 'down';
  if (statusCode >= 200 && statusCode < 400) {
    if (responseTimeMs !== null && responseTimeMs > 2500) return 'degraded';
    return 'up';
  }
  return 'down';
}

async function probeUrl(url: string, timeoutMs: number): Promise<Omit<EndpointResult, 'type' | 'label' | 'url'>> {
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });

    const responseTimeMs = Date.now() - startedAt;
    const statusCode = response.status;
    const status = classifyStatus(statusCode, responseTimeMs, null);

    return {
      status,
      statusCode,
      responseTimeMs,
      errorMessage: null,
      checkedAt,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startedAt;
    return {
      status: 'down',
      statusCode: null,
      responseTimeMs,
      errorMessage: error?.name === 'AbortError' ? 'Request timeout' : error?.message || 'Unknown error',
      checkedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildTargets(website: any, checkSubdomains: boolean = true): EndpointTarget[] {
  const targets: EndpointTarget[] = [];

  const primaryUrl = normalizeUrl(website.websiteUrl || website.domain?.domainName || '');
  if (primaryUrl) {
    targets.push({
      type: 'primary',
      label: 'Main Website',
      url: primaryUrl,
    });
  }

  if (!checkSubdomains) {
    return Array.from(new Map(targets.map((t) => [t.url, t])).values());
  }

  if (website.apiEndpoint) {
    const apiUrl = normalizeUrl(website.apiEndpoint);
    if (apiUrl) {
      targets.push({
        type: 'api',
        label: 'API Endpoint',
        url: apiUrl,
      });
    }
  }

  if (website.adminUrl) {
    const adminUrl = normalizeUrl(website.adminUrl);
    if (adminUrl) {
      targets.push({
        type: 'api',
        label: 'Admin URL',
        url: adminUrl,
      });
    }
  }

  for (const subdomain of website.subdomains || []) {
    const subUrl = normalizeUrl(subdomain.fullUrl || '');
    if (subUrl) {
      targets.push({
        type: 'subdomain',
        label: subdomain.subdomainName,
        url: subUrl,
      });
    }

    const subAdminUrl = normalizeUrl(subdomain.adminUrl || '');
    if (subAdminUrl) {
      targets.push({
        type: 'api',
        label: `${subdomain.subdomainName} Admin`,
        url: subAdminUrl,
      });
    }
  }

  const deduped = new Map<string, EndpointTarget>();
  for (const target of targets) {
    if (!deduped.has(target.url)) {
      deduped.set(target.url, target);
    }
  }

  return Array.from(deduped.values());
}

function aggregateStatus(statuses: MonitorStatus[]): MonitorStatus {
  if (statuses.some((s) => s === 'down')) return 'down';
  if (statuses.some((s) => s === 'degraded')) return 'degraded';
  return 'up';
}

async function persistUptimeResult(websiteId: number, endpoint: EndpointResult) {
  const existing = await prisma.uptimeCheck.findFirst({
    where: {
      websiteId,
      checkUrl: endpoint.url,
    },
    orderBy: {
      id: 'asc',
    },
  });

  const check = existing
    ? await prisma.uptimeCheck.update({
        where: { id: existing.id },
        data: {
          lastCheckAt: new Date(endpoint.checkedAt),
          lastStatus: endpoint.status,
        },
      })
    : await prisma.uptimeCheck.create({
        data: {
          website: { connect: { id: websiteId } },
          checkUrl: endpoint.url,
          checkIntervalMinutes: 5,
          timeoutSeconds: 15,
          expectedStatusCode: 200,
          isActive: true,
          lastCheckAt: new Date(endpoint.checkedAt),
          lastStatus: endpoint.status,
        },
      });

  await prisma.uptimeLog.create({
    data: {
      uptimeCheck: { connect: { id: check.id } },
      status: endpoint.status,
      responseTimeMs: endpoint.responseTimeMs,
      statusCode: endpoint.statusCode,
      errorMessage: endpoint.errorMessage,
      checkedAt: new Date(endpoint.checkedAt),
    },
  });

  return check.id;
}

async function syncWebsiteCheckLinks(websiteId: number, activeUrls: string[]) {
  const existingChecks = await prisma.uptimeCheck.findMany({
    where: { websiteId },
    select: {
      id: true,
      checkUrl: true,
      isActive: true,
    },
  });

  const activeSet = new Set(activeUrls);
  const staleIds = existingChecks
    .filter((check) => !activeSet.has(check.checkUrl) && check.isActive)
    .map((check) => check.id);

  if (staleIds.length > 0) {
    await prisma.uptimeCheck.updateMany({
      where: { id: { in: staleIds } },
      data: { isActive: false },
    });
  }

  const reactivateIds = existingChecks
    .filter((check) => activeSet.has(check.checkUrl) && !check.isActive)
    .map((check) => check.id);

  if (reactivateIds.length > 0) {
    await prisma.uptimeCheck.updateMany({
      where: { id: { in: reactivateIds } },
      data: { isActive: true },
    });
  }
}

// ─── Uptime percentage calculation ───────────────────────────────────────────

async function calculateUptimePercentage(checkId: number, hours: number = 24): Promise<number | null> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const logs = await prisma.uptimeLog.findMany({
    where: {
      uptimeCheckId: checkId,
      checkedAt: { gte: since },
    },
    select: { status: true },
  });

  if (logs.length === 0) return null;

  const upCount = logs.filter((l) => l.status === 'up').length;
  return Math.round((upCount / logs.length) * 10000) / 100;
}

// ─── Cached mode: fast DB read ───────────────────────────────────────────────

async function getCachedResults() {
  const websites = await prisma.website.findMany({
    where: {
      OR: [
        { websiteUrl: { not: null } },
        { apiEndpoint: { not: null } },
        { subdomains: { some: { fullUrl: { not: null } } } },
      ],
    },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      apiEndpoint: true,
      adminUrl: true,
      checkSubdomains: true,
      domain: { select: { domainName: true } },
      subdomains: {
        select: { id: true, subdomainName: true, fullUrl: true, adminUrl: true },
      },
      uptimeChecks: {
        where: { isActive: true },
        select: {
          id: true,
          checkUrl: true,
          lastCheckAt: true,
          lastStatus: true,
          logs: {
            take: 1,
            orderBy: { checkedAt: 'desc' },
            select: {
              status: true,
              responseTimeMs: true,
              statusCode: true,
              errorMessage: true,
              checkedAt: true,
            },
          },
        },
      },
    },
    orderBy: { websiteName: 'asc' },
  });

  const websiteResults = await Promise.all(
    websites.map(async (website) => {
      const targets = buildTargets(website, website.checkSubdomains ?? false);
      const checksByUrl = new Map(website.uptimeChecks.map((c) => [c.checkUrl, c]));

      const endpoints: EndpointResponse[] = await Promise.all(
        targets.map(async (target) => {
          const check = checksByUrl.get(target.url);
          const lastLog = check?.logs?.[0];
          const uptimePercentage24h = check ? await calculateUptimePercentage(check.id, 24) : null;

          return {
            checkId: check?.id ?? null,
            type: target.type,
            label: target.label,
            url: target.url,
            status: (lastLog?.status as MonitorStatus) ?? (check ? 'down' : 'unknown'),
            statusCode: lastLog?.statusCode ?? null,
            responseTimeMs: lastLog?.responseTimeMs ?? null,
            errorMessage: lastLog?.errorMessage ?? null,
            checkedAt: lastLog?.checkedAt?.toISOString() ?? new Date().toISOString(),
            uptimePercentage24h,
          };
        })
      );

      const statuses = endpoints.map((e) => e.status);
      const responseTimes = endpoints
        .map((e) => e.responseTimeMs)
        .filter((v): v is number => v !== null);

      const avgResponseTimeMs =
        responseTimes.length > 0
          ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length)
          : null;

      const uptimeValues = endpoints
        .map((e) => e.uptimePercentage24h)
        .filter((v): v is number => v !== null);

      const uptimePercentage24h =
        uptimeValues.length > 0
          ? Math.round((uptimeValues.reduce((s, v) => s + v, 0) / uptimeValues.length) * 100) / 100
          : null;

      return {
        websiteId: website.id,
        websiteName: website.websiteName,
        checkSubdomains: website.checkSubdomains ?? false,
        websiteStatus: statuses.length > 0 ? aggregateStatus(statuses) : ('unknown' as MonitorStatus),
        checkedEndpoints: endpoints.length,
        avgResponseTimeMs,
        uptimePercentage24h,
        lastCheckAt: endpoints.reduce((latest, e) => {
          const t = new Date(e.checkedAt).getTime();
          return t > latest ? t : latest;
        }, 0),
        endpoints,
      };
    })
  );

  return websiteResults
    .filter((w) => w.endpoints.length > 0)
    .map((w) => ({
      ...w,
      lastCheckAt: w.lastCheckAt ? new Date(w.lastCheckAt).toISOString() : null,
    }));
}

// ─── Live mode: real-time probing ────────────────────────────────────────────

async function getLiveResults(timeoutMs: number, shouldPersist: boolean) {
  const probeConcurrency = 5;

  const websites = await prisma.website.findMany({
    where: {
      OR: [
        { websiteUrl: { not: null } },
        { apiEndpoint: { not: null } },
        { subdomains: { some: { fullUrl: { not: null } } } },
      ],
    },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      apiEndpoint: true,
      adminUrl: true,
      checkSubdomains: true,
      domain: { select: { domainName: true } },
      subdomains: {
        select: { id: true, subdomainName: true, fullUrl: true, adminUrl: true },
      },
    },
    orderBy: { websiteName: 'asc' },
  });

  const websiteWithTargets = websites.map((website) => ({
    website,
    targets: buildTargets(website, website.checkSubdomains ?? false),
  }));

  if (shouldPersist) {
    await mapWithConcurrency(websiteWithTargets, probeConcurrency, async ({ website, targets }) => {
      await syncWebsiteCheckLinks(website.id, targets.map((t) => t.url));
      return null;
    });
  }

  const endpointJobs = websiteWithTargets.flatMap(({ website, targets }) =>
    targets.map((target) => ({ websiteId: website.id, target }))
  );

  const endpointOutputs = await mapWithConcurrency(endpointJobs, probeConcurrency, async ({ websiteId, target }) => {
    const probe = await probeUrl(target.url, timeoutMs);
    const result: EndpointResult = { ...target, ...probe };
    const checkId = shouldPersist ? await persistUptimeResult(websiteId, result) : null;
    const uptimePercentage24h = checkId ? await calculateUptimePercentage(checkId, 24) : null;

    return {
      websiteId,
      endpoint: { checkId, ...result, uptimePercentage24h } as EndpointResponse,
    };
  });

  const endpointsByWebsite = new Map<number, EndpointResponse[]>();
  for (const w of websites) endpointsByWebsite.set(w.id, []);
  for (const o of endpointOutputs) endpointsByWebsite.get(o.websiteId)?.push(o.endpoint);

  return websiteWithTargets.map(({ website }) => {
    const endpoints = endpointsByWebsite.get(website.id) || [];
    const responseTimes = endpoints.map((e) => e.responseTimeMs).filter((v): v is number => v !== null);
    const avgResponseTimeMs =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length)
        : null;

    const uptimeValues = endpoints.map((e) => e.uptimePercentage24h).filter((v): v is number => v !== null);
    const uptimePercentage24h =
      uptimeValues.length > 0
        ? Math.round((uptimeValues.reduce((s, v) => s + v, 0) / uptimeValues.length) * 100) / 100
        : null;

    const statuses = endpoints.map((e) => e.status);

    return {
      websiteId: website.id,
      websiteName: website.websiteName,
      checkSubdomains: website.checkSubdomains ?? false,
      websiteStatus: statuses.length > 0 ? aggregateStatus(statuses) : ('unknown' as MonitorStatus),
      checkedEndpoints: endpoints.length,
      avgResponseTimeMs,
      uptimePercentage24h,
      lastCheckAt: new Date().toISOString(),
      endpoints,
    };
  }).filter((w) => w.endpoints.length > 0);
}

// ─── Route handler ───────────────────────────────────────────────────────────

export const GET = asyncHandler(async (req: NextRequest) => {
  const live = req.nextUrl.searchParams.get('live') === 'true';
  const persist = req.nextUrl.searchParams.get('persist') !== 'false';
  const timeoutMs = Math.max(parseInt(req.nextUrl.searchParams.get('timeoutMs') || '10000', 10), 2000);

  const websiteResults = live
    ? await getLiveResults(timeoutMs, persist)
    : await getCachedResults();

  const allEndpoints = websiteResults.flatMap((w) => w.endpoints);
  const up = allEndpoints.filter((e) => e.status === 'up').length;
  const down = allEndpoints.filter((e) => e.status === 'down').length;
  const degraded = allEndpoints.filter((e) => e.status === 'degraded').length;

  const allResponseTimes = allEndpoints
    .map((e) => e.responseTimeMs)
    .filter((v): v is number => v !== null);
  const averageResponseTimeMs =
    allResponseTimes.length > 0
      ? Math.round(allResponseTimes.reduce((s, v) => s + v, 0) / allResponseTimes.length)
      : null;

  const allUptimes = websiteResults
    .map((w) => w.uptimePercentage24h)
    .filter((v): v is number => v !== null);
  const overallUptime24h =
    allUptimes.length > 0
      ? Math.round((allUptimes.reduce((s, v) => s + v, 0) / allUptimes.length) * 100) / 100
      : null;

  return ApiResponseHelper.success({
    mode: live ? 'live' : 'cached',
    websites: websiteResults,
    stats: {
      totalWebsites: websiteResults.length,
      totalEndpoints: allEndpoints.length,
      up,
      down,
      degraded,
      averageResponseTimeMs,
      overallUptime24h,
    },
  });
});
