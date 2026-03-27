import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';

function toMonthlyCost(amount: number, cycle: string): number {
  switch (cycle) {
    case 'monthly': return amount;
    case 'yearly': return amount / 12;
    case 'two_years': return amount / 24;
    case 'three_years': return amount / 36;
    case 'five_years': return amount / 60;
    case 'one_time': return 0;
    default: return amount;
  }
}

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      // Counts
      totalDomains,
      activeDomains,
      expiredDomains,
      totalServers,
      activeServers,
      totalWebsites,
      activeWebsites,
      totalClients,
      activeClients,
      openIncidents,
      // Expiring domains (within 30 days)
      expiringDomains,
      // All costs for monthly revenue calculation
      domainCosts,
      serverCosts,
      websiteCosts,
      clientCosts,
      // Domain expiry list (sorted by expiry date, nearest first)
      domainExpiryList,
      // Servers with latest monitoring
      serversWithMonitoring,
      // Recent activity logs
      recentActivity,
      // Notifications / Alerts
      alerts,
      // Websites overview
      websitesOverview,
      // Upcoming payments across all cost types
      upcomingDomainPayments,
      upcomingServerPayments,
      upcomingWebsitePayments,
      upcomingClientPayments,
    ] = await Promise.all([
      // Basic counts
      prisma.domain.count(),
      prisma.domain.count({ where: { status: 'active' } }),
      prisma.domain.count({ where: { status: 'expired' } }),
      prisma.server.count(),
      prisma.server.count({ where: { status: 'active' } }),
      prisma.website.count(),
      prisma.website.count({ where: { status: 'active' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'active' } }),
      prisma.securityIncident.count({ where: { status: { in: ['open', 'investigating'] } } }),

      // Domains expiring within 30 days
      prisma.domain.count({
        where: {
          expiryDate: { gte: now, lte: thirtyDaysFromNow },
          status: { not: 'expired' },
        },
      }),

      // All costs for revenue calculation
      prisma.domainCost.findMany({ select: { costAmount: true, currency: true, billingCycle: true } }),
      prisma.serverCost.findMany({ select: { costAmount: true, currency: true, billingCycle: true } }),
      prisma.websiteCost.findMany({ select: { costAmount: true, currency: true, billingCycle: true } }),
      prisma.clientCost.findMany({ select: { costAmount: true, currency: true, billingCycle: true } }),

      // Domain expiry tracker (top 15, sorted by expiry date)
      prisma.domain.findMany({
        where: { expiryDate: { not: null } },
        orderBy: { expiryDate: 'asc' },
        take: 15,
        select: {
          id: true,
          domainName: true,
          status: true,
          expiryDate: true,
          autoRenew: true,
          client: { select: { id: true, clientName: true } },
          registrar: { select: { id: true, providerName: true } },
        },
      }),

      // Servers with latest monitoring data
      prisma.server.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serverName: true,
          ipAddress: true,
          location: true,
          status: true,
          serverType: true,
          provider: { select: { providerName: true } },
          monitoring: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
            select: {
              cpuUsage: true,
              ramUsage: true,
              storageUsage: true,
              bandwidthUsage: true,
              uptimePercentage: true,
              responseTimeMs: true,
              recordedAt: true,
            },
          },
        },
      }),

      // Recent activity (last 15)
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          actionType: true,
          entityType: true,
          entityName: true,
          description: true,
          createdAt: true,
          user: { select: { fullName: true, username: true } },
        },
      }),

      // Alerts / Notifications (last 10 unread first)
      prisma.notification.findMany({
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        take: 10,
        select: {
          id: true,
          notificationType: true,
          entityType: true,
          title: true,
          message: true,
          severity: true,
          isRead: true,
          createdAt: true,
        },
      }),

      // Websites overview
      prisma.website.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          websiteName: true,
          websiteType: true,
          environment: true,
          status: true,
          websiteUrl: true,
          domain: { select: { domainName: true } },
          client: { select: { clientName: true } },
        },
      }),

      // Upcoming payments - domains
      prisma.domainCost.findMany({
        where: { nextBillingDate: { gte: now, lte: thirtyDaysFromNow } },
        select: {
          id: true,
          costAmount: true,
          currency: true,
          nextBillingDate: true,
          billingCycle: true,
          domain: { select: { domainName: true } },
        },
        orderBy: { nextBillingDate: 'asc' },
      }),

      // Upcoming payments - servers
      prisma.serverCost.findMany({
        where: { nextBillingDate: { gte: now, lte: thirtyDaysFromNow } },
        select: {
          id: true,
          costAmount: true,
          currency: true,
          nextBillingDate: true,
          billingCycle: true,
          server: { select: { serverName: true } },
        },
        orderBy: { nextBillingDate: 'asc' },
      }),

      // Upcoming payments - websites
      prisma.websiteCost.findMany({
        where: { nextBillingDate: { gte: now, lte: thirtyDaysFromNow } },
        select: {
          id: true,
          costAmount: true,
          currency: true,
          nextBillingDate: true,
          billingCycle: true,
          website: { select: { websiteName: true } },
        },
        orderBy: { nextBillingDate: 'asc' },
      }),

      // Upcoming payments - clients
      prisma.clientCost.findMany({
        where: { nextBillingDate: { gte: now, lte: thirtyDaysFromNow } },
        select: {
          id: true,
          costAmount: true,
          currency: true,
          nextBillingDate: true,
          billingCycle: true,
          client: { select: { clientName: true } },
        },
        orderBy: { nextBillingDate: 'asc' },
      }),
    ]);

    const allCosts = [...domainCosts, ...serverCosts, ...websiteCosts, ...clientCosts];
    const totalMonthlyCost = allCosts.reduce((sum, c) => sum + toMonthlyCost(c.costAmount, c.billingCycle), 0);

    // Calculate average uptime from monitoring
    const uptimeValues = serversWithMonitoring
      .filter((s) => s.monitoring.length > 0 && s.monitoring[0].uptimePercentage != null)
      .map((s) => s.monitoring[0].uptimePercentage!);
    const avgUptime = uptimeValues.length > 0
      ? uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length
      : 0;

    // Build upcoming payments list
    const upcomingPayments = [
      ...upcomingDomainPayments.map((p) => ({
        type: 'domain' as const,
        name: p.domain.domainName,
        amount: p.costAmount,
        currency: p.currency,
        date: p.nextBillingDate,
        cycle: p.billingCycle,
      })),
      ...upcomingServerPayments.map((p) => ({
        type: 'server' as const,
        name: p.server.serverName,
        amount: p.costAmount,
        currency: p.currency,
        date: p.nextBillingDate,
        cycle: p.billingCycle,
      })),
      ...upcomingWebsitePayments.map((p) => ({
        type: 'website' as const,
        name: p.website.websiteName,
        amount: p.costAmount,
        currency: p.currency,
        date: p.nextBillingDate,
        cycle: p.billingCycle,
      })),
      ...upcomingClientPayments.map((p) => ({
        type: 'client' as const,
        name: p.client.clientName,
        amount: p.costAmount,
        currency: p.currency,
        date: p.nextBillingDate,
        cycle: p.billingCycle,
      })),
    ].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    return ApiResponseHelper.success({
      stats: {
        totalDomains,
        activeDomains,
        expiredDomains,
        expiringDomains,
        totalServers,
        activeServers,
        totalWebsites,
        activeWebsites,
        totalClients,
        activeClients,
        openIncidents,
        totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
        avgUptime: Math.round(avgUptime * 100) / 100,
      },
      domainExpiryList,
      servers: serversWithMonitoring,
      recentActivity,
      alerts,
      websitesOverview,
      upcomingPayments,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
