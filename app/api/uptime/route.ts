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
}

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

function buildTargets(website: any): EndpointTarget[] {
  const targets: EndpointTarget[] = [];

  const primaryUrl = normalizeUrl(website.websiteUrl || website.domain?.domainName || '');
  if (primaryUrl) {
    targets.push({
      type: 'primary',
      label: 'Main Website',
      url: primaryUrl,
    });
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

function aggregateWebsiteStatus(endpointResults: EndpointResult[]): MonitorStatus {
  if (endpointResults.some((e) => e.status === 'down')) return 'down';
  if (endpointResults.some((e) => e.status === 'degraded')) return 'degraded';
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

export const GET = asyncHandler(async (req: NextRequest) => {
  const timeoutMs = Math.max(parseInt(req.nextUrl.searchParams.get('timeoutMs') || '10000', 10), 2000);
  const shouldPersist = req.nextUrl.searchParams.get('persist') === 'true';
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
      domain: {
        select: {
          domainName: true,
        },
      },
      subdomains: {
        select: {
          id: true,
          subdomainName: true,
          fullUrl: true,
          adminUrl: true,
        },
      },
    },
    orderBy: {
      websiteName: 'asc',
    },
  });

  const websiteWithTargets = websites.map((website) => ({
    website,
    targets: buildTargets(website),
  }));

  if (shouldPersist) {
    await mapWithConcurrency(websiteWithTargets, probeConcurrency, async ({ website, targets }) => {
      await syncWebsiteCheckLinks(
        website.id,
        targets.map((target) => target.url)
      );
      return null;
    });
  }

  const endpointJobs = websiteWithTargets.flatMap(({ website, targets }) =>
    targets.map((target) => ({
      websiteId: website.id,
      target,
    }))
  );

  const endpointOutputs = await mapWithConcurrency(endpointJobs, probeConcurrency, async ({ websiteId, target }) => {
    const probe = await probeUrl(target.url, timeoutMs);
    const result: EndpointResult = {
      ...target,
      ...probe,
    };

    const checkId = shouldPersist ? await persistUptimeResult(websiteId, result) : null;

    return {
      websiteId,
      endpoint: {
        checkId,
        ...result,
      } as EndpointResponse,
    };
  });

  const endpointsByWebsite = new Map<number, EndpointResponse[]>();
  for (const website of websites) {
    endpointsByWebsite.set(website.id, []);
  }

  for (const output of endpointOutputs) {
    const websiteEndpoints = endpointsByWebsite.get(output.websiteId);
    if (websiteEndpoints) {
      websiteEndpoints.push(output.endpoint);
    }
  }

  const websiteResults = websiteWithTargets.map(({ website }) => {
    const endpointResults = endpointsByWebsite.get(website.id) || [];
    const responseTimes = endpointResults
      .map((e) => e.responseTimeMs)
      .filter((value): value is number => value !== null);

    const avgResponseTimeMs =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
        : null;

    const websiteStatus = endpointResults.length > 0 ? aggregateWebsiteStatus(endpointResults) : 'down';

    return {
      websiteId: website.id,
      websiteName: website.websiteName,
      websiteStatus,
      checkedEndpoints: endpointResults.length,
      avgResponseTimeMs,
      endpoints: endpointResults,
    };
  });

  const allEndpoints = websiteResults.flatMap((website) => website.endpoints);
  const up = allEndpoints.filter((e) => e.status === 'up').length;
  const down = allEndpoints.filter((e) => e.status === 'down').length;
  const degraded = allEndpoints.filter((e) => e.status === 'degraded').length;

  const allResponseTimes = allEndpoints
    .map((e) => e.responseTimeMs)
    .filter((value): value is number => value !== null);

  const averageResponseTimeMs =
    allResponseTimes.length > 0
      ? Math.round(allResponseTimes.reduce((sum, value) => sum + value, 0) / allResponseTimes.length)
      : null;

  return ApiResponseHelper.success({
    websites: websiteResults,
    stats: {
      totalWebsites: websiteResults.length,
      totalEndpoints: allEndpoints.length,
      up,
      down,
      degraded,
      averageResponseTimeMs,
    },
  });
});
