'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api/client';

export type MonitorStatus = 'up' | 'down' | 'degraded';

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
}

export interface UptimeWebsite {
  websiteId: number;
  websiteName: string;
  websiteStatus: MonitorStatus;
  checkedEndpoints: number;
  avgResponseTimeMs: number | null;
  endpoints: UptimeEndpoint[];
}

export interface UptimeStats {
  totalWebsites: number;
  totalEndpoints: number;
  up: number;
  down: number;
  degraded: number;
  averageResponseTimeMs: number | null;
}

interface UptimeApiResponse {
  websites: UptimeWebsite[];
  stats: UptimeStats;
}

export function useUptimeMonitor() {
  const [websites, setWebsites] = useState<UptimeWebsite[]>([]);
  const [stats, setStats] = useState<UptimeStats>({
    totalWebsites: 0,
    totalEndpoints: 0,
    up: 0,
    down: 0,
    degraded: 0,
    averageResponseTimeMs: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUptime = useCallback(async (persist = true, showPageLoader = false) => {
    try {
      setError(null);
      if (showPageLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await ApiClient.get<UptimeApiResponse>('/uptime', {
        persist,
      });

      const data = response.data;
      if (!data) {
        throw new Error('Invalid uptime response');
      }

      setWebsites(data.websites || []);
      setStats(data.stats || {
        totalWebsites: 0,
        totalEndpoints: 0,
        up: 0,
        down: 0,
        degraded: 0,
        averageResponseTimeMs: null,
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
    loading,
    error,
    refreshing,
    refresh,
    runLiveCheck,
  };
}
