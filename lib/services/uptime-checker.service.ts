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

export class UptimeCheckerService {
  private static isRunning = false;

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

      await this.checkWebsitesWithConcurrency(
        websites,
        settings.maxConcurrentChecks,
        settings.timeoutSeconds * 1000,
        settings
      );

      console.log('[UptimeChecker] Automatic check completed');
    } catch (error) {
      console.error('[UptimeChecker] Error during automatic check:', error);
    } finally {
      this.isRunning = false;
    }
  }

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

  private static buildTargets(website: any): EndpointTarget[] {
    const targets: EndpointTarget[] = [];

    const primaryUrl = this.normalizeUrl(website.websiteUrl || website.domain?.domainName || '');
    if (primaryUrl) {
      targets.push({
        type: 'primary',
        label: 'Main Website',
        url: primaryUrl,
      });
    }

    if (website.apiEndpoint) {
      const apiUrl = this.normalizeUrl(website.apiEndpoint);
      if (apiUrl) {
        targets.push({
          type: 'api',
          label: 'API Endpoint',
          url: apiUrl,
        });
      }
    }

    if (website.adminUrl) {
      const adminUrl = this.normalizeUrl(website.adminUrl);
      if (adminUrl) {
        targets.push({
          type: 'api',
          label: 'Admin URL',
          url: adminUrl,
        });
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

  private static async checkWebsitesWithConcurrency(
    websites: any[],
    concurrency: number,
    timeoutMs: number,
    settings: any
  ): Promise<void> {
    const endpointJobs = websites.flatMap((website) => {
      const targets = this.buildTargets(website);
      return targets.map((target) => ({
        websiteId: website.id,
        websiteName: website.websiteName,
        target,
      }));
    });

    await this.mapWithConcurrency(endpointJobs, concurrency, async (job) => {
      const result = await this.probeUrl(job.target.url, timeoutMs);
      await this.persistAndNotify(job.websiteId, job.websiteName, job.target, result, settings);
    });
  }

  private static async mapWithConcurrency<T>(
    items: T[],
    concurrency: number,
    mapper: (item: T) => Promise<void>
  ): Promise<void> {
    if (items.length === 0) return;

    let nextIndex = 0;
    const limit = Math.max(1, Math.min(concurrency, items.length));

    const worker = async () => {
      while (true) {
        const currentIndex = nextIndex;
        nextIndex += 1;

        if (currentIndex >= items.length) {
          break;
        }

        await mapper(items[currentIndex]);
      }
    };

    await Promise.all(Array.from({ length: limit }, () => worker()));
  }

  private static async probeUrl(url: string, timeoutMs: number): Promise<CheckResult> {
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
      const status = this.classifyStatus(statusCode, responseTimeMs, null);

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
        errorMessage: error?.name === 'AbortError' ? 'Request timeout' : error?.message || 'Unknown error',
        checkedAt,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private static classifyStatus(
    statusCode: number | null,
    responseTimeMs: number | null,
    errorMessage: string | null
  ): MonitorStatus {
    if (errorMessage || !statusCode) return 'down';
    if (statusCode >= 200 && statusCode < 400) {
      if (responseTimeMs !== null && responseTimeMs > 2500) return 'degraded';
      return 'up';
    }
    return 'down';
  }

  private static async persistAndNotify(
    websiteId: number,
    websiteName: string,
    target: EndpointTarget,
    result: CheckResult,
    settings: any
  ): Promise<void> {
    const existingCheck = await prisma.uptimeCheck.findFirst({
      where: {
        websiteId,
        checkUrl: result.url,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const previousStatus = existingCheck?.lastStatus;

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

    if (settings.enableNotifications) {
      await this.handleNotifications(
        websiteId,
        websiteName,
        result,
        previousStatus,
        settings
      );
    }
  }

  private static async handleNotifications(
    websiteId: number,
    websiteName: string,
    result: CheckResult,
    previousStatus: string | null | undefined,
    settings: any
  ): Promise<void> {
    if (result.status === 'down' && previousStatus !== 'down' && settings.notifyOnDown) {
      const recentLogs = await prisma.uptimeLog.findMany({
        where: {
          uptimeCheck: {
            websiteId,
            checkUrl: result.url,
          },
          status: 'down',
        },
        orderBy: { checkedAt: 'desc' },
        take: settings.consecutiveFailsBeforeAlert,
      });

      if (recentLogs.length >= settings.consecutiveFailsBeforeAlert) {
        await NotificationService.sendUptimeNotification({
          type: 'uptime_down',
          websiteId,
          websiteName,
          url: result.url,
          status: result.status,
          errorMessage: result.errorMessage,
          severity: 'critical',
        });
      }
    }

    if (result.status === 'up' && previousStatus === 'down' && settings.notifyOnRecovery) {
      await NotificationService.sendUptimeNotification({
        type: 'uptime_recovery',
        websiteId,
        websiteName,
        url: result.url,
        status: result.status,
        responseTime: result.responseTimeMs,
        severity: 'info',
      });
    }

    if (result.status === 'degraded' && previousStatus !== 'degraded' && settings.notifyOnDegraded) {
      await NotificationService.sendUptimeNotification({
        type: 'uptime_degraded',
        websiteId,
        websiteName,
        url: result.url,
        status: result.status,
        responseTime: result.responseTimeMs,
        severity: 'warning',
      });
    }
  }
}
