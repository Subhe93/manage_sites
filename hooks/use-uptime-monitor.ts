'use client';

import { useCallback, useEffect, useState } from 'react';

export type MonitorStatus = 'up' | 'down' | 'degraded' | 'unknown';

export interface UptimeEndpoint {
  checkId: number | null;
  type: 'primary' | 'subdomain' | 'api';
  label: string;
  url: string;
  status: MonitorStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
  uptimePercentage24h: number | null;
}

export interface UptimeWebsite {
  websiteId: number;
  websiteName: string;
  checkSubdomains: boolean;
  websiteStatus: MonitorStatus;
  checkedEndpoints: number;
  avgResponseTimeMs: number | null;
  uptimePercentage24h: number | null;
  lastCheckAt: string | null;
  endpoints: UptimeEndpoint[];
}

export interface UptimeStats {
  totalWebsites: number;
  totalEndpoints: number;
  up: number;
  down: number;
  degraded: number;
  averageResponseTimeMs: number | null;
  overallUptime24h: number | null;
}

interface UptimeApiResponse {
  mode: 'cached' | 'live';
  websites: UptimeWebsite[];
  stats: UptimeStats;
}

export function useUptimeMonitor() {
  const [websites, setWebsites] = useState<UptimeWebsite[]>([]);
  const [mode, setMode] = useState<'cached' | 'live'>('cached');
  const [stats, setStats] = useState<UptimeStats>({
    totalWebsites: 0,
    totalEndpoints: 0,
    up: 0,
    down: 0,
    degraded: 0,
    averageResponseTimeMs: null,
    overallUptime24h: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUptime = useCallback(async (live = false, showPageLoader = false) => {
    try {
      setError(null);
      if (showPageLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = new URLSearchParams();
      if (live) params.set('live', 'true');

      const res = await fetch(`/api/uptime?${params.toString()}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error?.message || 'Invalid uptime response');
      }

      const data = json.data as UptimeApiResponse;
      setWebsites(data.websites || []);
      setMode(data.mode);
      setStats(data.stats || {
        totalWebsites: 0,
        totalEndpoints: 0,
        up: 0,
        down: 0,
        degraded: 0,
        averageResponseTimeMs: null,
        overallUptime24h: null,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load uptime monitor data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUptime(false, true);
  }, [fetchUptime]);

  const refresh = useCallback(() => fetchUptime(false, false), [fetchUptime]);
  const runLiveCheck = useCallback(() => fetchUptime(true, false), [fetchUptime]);

  return {
    websites,
    stats,
    mode,
    loading,
    error,
    refreshing,
    refresh,
    runLiveCheck,
  };
}
