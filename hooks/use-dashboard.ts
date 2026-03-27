'use client';

import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalDomains: number;
  activeDomains: number;
  expiredDomains: number;
  expiringDomains: number;
  totalServers: number;
  activeServers: number;
  totalWebsites: number;
  activeWebsites: number;
  totalClients: number;
  activeClients: number;
  openIncidents: number;
  totalMonthlyCost: number;
  avgUptime: number;
}

export interface DomainExpiry {
  id: number;
  domainName: string;
  status: string;
  expiryDate: string;
  autoRenew: boolean;
  client: { id: number; clientName: string } | null;
  registrar: { id: number; providerName: string } | null;
}

export interface ServerWithMonitoring {
  id: number;
  serverName: string;
  ipAddress: string | null;
  location: string | null;
  status: string;
  serverType: string;
  provider: { providerName: string } | null;
  monitoring: {
    cpuUsage: number | null;
    ramUsage: number | null;
    storageUsage: number | null;
    bandwidthUsage: number | null;
    uptimePercentage: number | null;
    responseTimeMs: number | null;
    recordedAt: string;
  }[];
}

export interface ActivityItem {
  id: number;
  actionType: string;
  entityType: string;
  entityName: string | null;
  description: string | null;
  createdAt: string;
  user: { fullName: string | null; username: string } | null;
}

export interface AlertItem {
  id: number;
  notificationType: string;
  entityType: string;
  title: string;
  message: string | null;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export interface WebsiteOverview {
  id: number;
  websiteName: string;
  websiteType: string;
  environment: string;
  status: string;
  websiteUrl: string | null;
  domain: { domainName: string } | null;
  client: { clientName: string } | null;
}

export interface UpcomingPayment {
  type: 'domain' | 'server' | 'website' | 'client';
  name: string;
  amount: number;
  currency: string;
  date: string;
  cycle: string;
}

export interface DashboardData {
  stats: DashboardStats;
  domainExpiryList: DomainExpiry[];
  servers: ServerWithMonitoring[];
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
  websitesOverview: WebsiteOverview[];
  upcomingPayments: UpcomingPayment[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error?.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return { data, loading, error };
}
