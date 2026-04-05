import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';

type MonitorStatus = 'up' | 'down' | 'degraded' | 'unknown';

interface EndpointTarget {
  type: 'primary' | 'subdomain' | 'api';
  label: string;
  url: string;
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

async function probeUrl(url: string, timeoutMs: number) {
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

    return { status, statusCode, responseTimeMs, errorMessage: null, checkedAt };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startedAt;
    return {
      status: 'down' as MonitorStatus,
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
  const checkSubdomains = website.checkSubdomains ?? false;

  const primaryUrl = normalizeUrl(website.websiteUrl || website.domain?.domainName || '');
  if (primaryUrl) {
    targets.push({ type: 'primary', label: 'Main Website', url: primaryUrl });
  }

  if (!checkSubdomains) {
    return targets;
  }

  if (website.apiEndpoint) {
    const apiUrl = normalizeUrl(website.apiEndpoint);
    if (apiUrl) targets.push({ type: 'api', label: 'API Endpoint', url: apiUrl });
  }

  if (website.adminUrl) {
    const adminUrl = normalizeUrl(website.adminUrl);
    if (adminUrl) targets.push({ type: 'api', label: 'Admin URL', url: adminUrl });
  }

  for (const subdomain of website.subdomains || []) {
    const subUrl = normalizeUrl(subdomain.fullUrl || '');
    if (subUrl) targets.push({ type: 'subdomain', label: subdomain.subdomainName, url: subUrl });

    const subAdminUrl = normalizeUrl(subdomain.adminUrl || '');
    if (subAdminUrl) targets.push({ type: 'api', label: `${subdomain.subdomainName} Admin`, url: subAdminUrl });
  }

  return Array.from(new Map(targets.map((t) => [t.url, t])).values());
}

function aggregateStatus(statuses: MonitorStatus[]): MonitorStatus {
  if (statuses.some((s) => s === 'down')) return 'down';
  if (statuses.some((s) => s === 'degraded')) return 'degraded';
  if (statuses.every((s) => s === 'up')) return 'up';
  return 'unknown';
}

export const POST = asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
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
      apiEndpoint: true,
      adminUrl: true,
      checkSubdomains: true,
      domain: { select: { domainName: true } },
      subdomains: {
        select: { id: true, subdomainName: true, fullUrl: true, adminUrl: true },
      },
    },
  });

  if (!website) {
    return ApiResponseHelper.error('Website not found', 404);
  }

  const targets = buildTargets(website);
  const timeoutMs = 10000;

  const endpoints = await Promise.all(
    targets.map(async (target) => {
      const probe = await probeUrl(target.url, timeoutMs);
      return {
        type: target.type,
        label: target.label,
        url: target.url,
        ...probe,
      };
    })
  );

  const statuses = endpoints.map((e) => e.status as MonitorStatus);
  const responseTimes = endpoints.map((e) => e.responseTimeMs).filter((v): v is number => v !== null);
  const avgResponseTimeMs = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length)
    : null;

  return ApiResponseHelper.success({
    websiteId: website.id,
    websiteName: website.websiteName,
    checkSubdomains: website.checkSubdomains,
    websiteStatus: statuses.length > 0 ? aggregateStatus(statuses) : 'unknown',
    checkedEndpoints: endpoints.length,
    avgResponseTimeMs,
    lastCheckAt: new Date().toISOString(),
    endpoints,
  });
});
