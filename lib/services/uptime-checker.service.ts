import prisma from '@/lib/prisma';
import { NotificationService } from './notification.service';

type MonitorStatus = 'up' | 'down' | 'degraded';

interface CheckResult {
  url: string;
  status: MonitorStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: Date;
}

interface EndpointTarget {
  type: 'primary' | 'subdomain' | 'api';
  label: string;
  url: string;
}

interface EndpointCheckResult {
  target: EndpointTarget;
  result: CheckResult;
  previousStatus: string | null;
}

interface WebsiteCheckSummary {
  websiteId: number;
  websiteName: string;
  endpoints: EndpointCheckResult[];
  overallStatus: MonitorStatus;
  newlyDown: EndpointCheckResult[];
  newlyRecovered: EndpointCheckResult[];
  newlyDegraded: EndpointCheckResult[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_RETRY_COUNT = 1;
const RETRY_DELAY_MS = 2000;
const DEFAULT_WEBSITE_CONCURRENCY = 3;
const DEFAULT_ENDPOINT_CONCURRENCY = 3;

export class UptimeCheckerService {
  private static isRunning = false;

  // ─── Main entry point ──────────────────────────────────────────────────────

  static async runAutomaticCheck(): Promise<void> {
    if (this.isRunning) {
      console.log('[UptimeChecker] Check already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('[UptimeChecker] Starting automatic uptime check...');

      const settings = await this.getSettings();
      if (!settings || !settings.isEnabled) {
        console.log('[UptimeChecker] Uptime monitoring is disabled');
        return;
      }

      const websites = await this.getActiveWebsites();
      console.log(`[UptimeChecker] Found ${websites.length} websites to check`);

      const websiteConcurrency = Math.min(
        DEFAULT_WEBSITE_CONCURRENCY,
        Math.ceil(settings.maxConcurrentChecks / 2)
      );
      const endpointConcurrency = Math.max(
        1,
        Math.floor(settings.maxConcurrentChecks / websiteConcurrency)
      );

      const summaries = await this.checkAllWebsites(
        websites,
        websiteConcurrency,
        endpointConcurrency,
        settings
      );

      if (settings.enableNotifications) {
        await this.sendGroupedNotifications(summaries, settings);
      }

      const totalEndpoints = summaries.reduce((s, w) => s + w.endpoints.length, 0);
      const downCount = summaries.reduce((s, w) => s + w.newlyDown.length, 0);
      console.log(
        `[UptimeChecker] Check completed: ${websites.length} websites, ${totalEndpoints} endpoints, ${downCount} newly down`
      );
    } catch (error) {
      console.error('[UptimeChecker] Error during automatic check:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // ─── Settings & data ───────────────────────────────────────────────────────

  private static async getSettings() {
    const settings = await prisma.uptimeMonitorSettings.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!settings) {
      await prisma.uptimeMonitorSettings.create({
        data: {
          isEnabled: false,
          checkIntervalMinutes: 5,
          enableNotifications: true,
          notifyOnDown: true,
          notifyOnRecovery: true,
          notifyOnDegraded: false,
          consecutiveFailsBeforeAlert: 2,
          timeoutSeconds: 10,
          maxConcurrentChecks: 5,
          checkSubdomains: true,
          degradedThresholdMs: 2500,
          logRetentionDays: 30,
        },
      });
      return null;
    }

    return settings;
  }

  private static async getActiveWebsites() {
    return prisma.website.findMany({
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
    });
  }

  // ─── Two-level concurrency: websites → endpoints ───────────────────────────

  private static async checkAllWebsites(
    websites: any[],
    websiteConcurrency: number,
    endpointConcurrency: number,
    settings: any
  ): Promise<WebsiteCheckSummary[]> {
    return this.mapWithConcurrency(websites, websiteConcurrency, async (website) => {
      return this.checkSingleWebsite(website, endpointConcurrency, settings);
    });
  }

  private static async checkSingleWebsite(
    website: any,
    endpointConcurrency: number,
    settings: any
  ): Promise<WebsiteCheckSummary> {
    const checkSubdomains = website.checkSubdomains ?? false;
    const targets = this.buildTargets(website, checkSubdomains);
    const timeoutMs = settings.timeoutSeconds * 1000;
    const degradedThresholdMs = settings.degradedThresholdMs ?? 2500;

    console.log(
      `[UptimeChecker] Checking "${website.websiteName}" (${targets.length} endpoints)`
    );

    const endpointResults = await this.mapWithConcurrency(
      targets,
      endpointConcurrency,
      async (target) => {
        const result = await this.probeWithRetry(
          target.url,
          timeoutMs,
          degradedThresholdMs,
          DEFAULT_RETRY_COUNT
        );

        const previousStatus = await this.persistResult(
          website.id,
          target,
          result,
          settings
        );

        return {
          target,
          result,
          previousStatus,
        } as EndpointCheckResult;
      }
    );

    const statuses = endpointResults.map((e) => e.result.status);
    const overallStatus = this.aggregateStatus(statuses);

    const newlyDown = endpointResults.filter(
      (e) => e.result.status === 'down' && e.previousStatus !== 'down'
    );
    const newlyRecovered = endpointResults.filter(
      (e) => e.result.status === 'up' && e.previousStatus === 'down'
    );
    const newlyDegraded = endpointResults.filter(
      (e) => e.result.status === 'degraded' && e.previousStatus !== 'degraded'
    );

    return {
      websiteId: website.id,
      websiteName: website.websiteName,
      endpoints: endpointResults,
      overallStatus,
      newlyDown,
      newlyRecovered,
      newlyDegraded,
    };
  }

  // ─── Probing with retry ────────────────────────────────────────────────────

  private static async probeWithRetry(
    url: string,
    timeoutMs: number,
    degradedThresholdMs: number,
    retries: number
  ): Promise<CheckResult> {
    let lastResult = await this.probeUrl(url, timeoutMs, degradedThresholdMs);

    if (lastResult.status !== 'down' || retries <= 0) {
      return lastResult;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(
        `[UptimeChecker] Retry ${attempt}/${retries} for ${url}`
      );
      await this.sleep(RETRY_DELAY_MS);
      lastResult = await this.probeUrl(url, timeoutMs, degradedThresholdMs);

      if (lastResult.status !== 'down') {
        return lastResult;
      }
    }

    return lastResult;
  }

  private static async probeUrl(
    url: string,
    timeoutMs: number,
    degradedThresholdMs: number
  ): Promise<CheckResult> {
    const checkedAt = new Date();
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
      const status = this.classifyStatus(
        statusCode,
        responseTimeMs,
        null,
        degradedThresholdMs
      );

      return {
        url,
        status,
        statusCode,
        responseTimeMs,
        errorMessage: null,
        checkedAt,
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - startedAt;
      return {
        url,
        status: 'down',
        statusCode: null,
        responseTimeMs,
        errorMessage:
          error?.name === 'AbortError'
            ? 'Request timeout'
            : error?.message || 'Unknown error',
        checkedAt,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // ─── Persistence ───────────────────────────────────────────────────────────

  private static async persistResult(
    websiteId: number,
    target: EndpointTarget,
    result: CheckResult,
    settings: any
  ): Promise<string | null> {
    const existingCheck = await prisma.uptimeCheck.findFirst({
      where: {
        websiteId,
        checkUrl: result.url,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const previousStatus = existingCheck?.lastStatus ?? null;

    const check = existingCheck
      ? await prisma.uptimeCheck.update({
          where: { id: existingCheck.id },
          data: {
            lastCheckAt: result.checkedAt,
            lastStatus: result.status,
          },
        })
      : await prisma.uptimeCheck.create({
          data: {
            website: { connect: { id: websiteId } },
            checkUrl: result.url,
            checkIntervalMinutes: settings.checkIntervalMinutes,
            timeoutSeconds: settings.timeoutSeconds,
            expectedStatusCode: 200,
            isActive: true,
            lastCheckAt: result.checkedAt,
            lastStatus: result.status,
          },
        });

    await prisma.uptimeLog.create({
      data: {
        uptimeCheck: { connect: { id: check.id } },
        status: result.status,
        responseTimeMs: result.responseTimeMs,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
        checkedAt: result.checkedAt,
      },
    });

    return previousStatus;
  }

  // ─── Grouped notifications (per website) ───────────────────────────────────

  private static async sendGroupedNotifications(
    summaries: WebsiteCheckSummary[],
    settings: any
  ): Promise<void> {
    for (const summary of summaries) {
      if (summary.newlyDown.length > 0 && settings.notifyOnDown) {
        await this.notifyWebsiteDown(summary, settings);
      }

      if (summary.newlyRecovered.length > 0 && settings.notifyOnRecovery) {
        await this.notifyWebsiteRecovery(summary);
      }

      if (summary.newlyDegraded.length > 0 && settings.notifyOnDegraded) {
        await this.notifyWebsiteDegraded(summary);
      }
    }
  }

  private static async notifyWebsiteDown(
    summary: WebsiteCheckSummary,
    settings: any
  ): Promise<void> {
    for (const ep of summary.newlyDown) {
      const recentLogs = await prisma.uptimeLog.findMany({
        where: {
          uptimeCheck: {
            websiteId: summary.websiteId,
            checkUrl: ep.result.url,
          },
          status: 'down',
        },
        orderBy: { checkedAt: 'desc' },
        take: settings.consecutiveFailsBeforeAlert,
      });

      if (recentLogs.length >= settings.consecutiveFailsBeforeAlert) {
        const downUrls = summary.newlyDown.map((e) => e.result.url);
        await NotificationService.sendUptimeNotification({
          type: 'uptime_down',
          websiteId: summary.websiteId,
          websiteName: summary.websiteName,
          url: ep.result.url,
          status: ep.result.status,
          errorMessage:
            summary.newlyDown.length === 1
              ? ep.result.errorMessage
              : `${summary.newlyDown.length} endpoints down: ${downUrls.join(', ')}`,
          severity: 'critical',
        });
        break;
      }
    }
  }

  private static async notifyWebsiteRecovery(
    summary: WebsiteCheckSummary
  ): Promise<void> {
    const recoveredUrls = summary.newlyRecovered.map((e) => e.result.url);
    const first = summary.newlyRecovered[0];

    await NotificationService.sendUptimeNotification({
      type: 'uptime_recovery',
      websiteId: summary.websiteId,
      websiteName: summary.websiteName,
      url: first.result.url,
      status: first.result.status,
      responseTime: first.result.responseTimeMs,
      severity: 'info',
    });
  }

  private static async notifyWebsiteDegraded(
    summary: WebsiteCheckSummary
  ): Promise<void> {
    const first = summary.newlyDegraded[0];

    await NotificationService.sendUptimeNotification({
      type: 'uptime_degraded',
      websiteId: summary.websiteId,
      websiteName: summary.websiteName,
      url: first.result.url,
      status: first.result.status,
      responseTime: first.result.responseTimeMs,
      severity: 'warning',
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private static buildTargets(website: any, checkSubdomains: boolean = true): EndpointTarget[] {
    const targets: EndpointTarget[] = [];

    const primaryUrl = this.normalizeUrl(
      website.websiteUrl || website.domain?.domainName || ''
    );
    if (primaryUrl) {
      targets.push({ type: 'primary', label: 'Main Website', url: primaryUrl });
    }

    if (!checkSubdomains) {
      return targets;
    }

    if (website.apiEndpoint) {
      const apiUrl = this.normalizeUrl(website.apiEndpoint);
      if (apiUrl) {
        targets.push({ type: 'api', label: 'API Endpoint', url: apiUrl });
      }
    }

    if (website.adminUrl) {
      const adminUrl = this.normalizeUrl(website.adminUrl);
      if (adminUrl) {
        targets.push({ type: 'api', label: 'Admin URL', url: adminUrl });
      }
    }

    for (const subdomain of website.subdomains || []) {
      const subUrl = this.normalizeUrl(subdomain.fullUrl || '');
      if (subUrl) {
        targets.push({
          type: 'subdomain',
          label: subdomain.subdomainName,
          url: subUrl,
        });
      }

      const subAdminUrl = this.normalizeUrl(subdomain.adminUrl || '');
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

  private static normalizeUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  private static classifyStatus(
    statusCode: number | null,
    responseTimeMs: number | null,
    errorMessage: string | null,
    degradedThresholdMs: number = 2500
  ): MonitorStatus {
    if (errorMessage || !statusCode) return 'down';
    if (statusCode >= 200 && statusCode < 400) {
      if (responseTimeMs !== null && responseTimeMs > degradedThresholdMs)
        return 'degraded';
      return 'up';
    }
    return 'down';
  }

  private static aggregateStatus(statuses: MonitorStatus[]): MonitorStatus {
    if (statuses.some((s) => s === 'down')) return 'down';
    if (statuses.some((s) => s === 'degraded')) return 'degraded';
    return 'up';
  }

  private static async mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    mapper: (item: T) => Promise<R>
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

        results[currentIndex] = await mapper(items[currentIndex]);
      }
    };

    await Promise.all(Array.from({ length: limit }, () => worker()));

    return results;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
