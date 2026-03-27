'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActivityLogsApi } from '@/lib/api/client';

export interface ActivityLogItem {
  id: number;
  userId: number | null;
  actionType: string;
  entityType: string;
  entityId: number | null;
  entityName: string | null;
  description: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string | null;
  } | null;
}

export interface ActivityLogStats {
  total: number;
  byActionType: Record<string, number>;
}

export function useActivityLogs(params?: {
  page?: number;
  pageSize?: number;
  actionType?: string;
  entityType?: string;
  userId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<ActivityLogStats>({ total: 0, byActionType: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page: params?.page,
        pageSize: params?.pageSize,
        actionType: params?.actionType,
        entityType: params?.entityType,
        userId: params?.userId,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      };

      const result = await ActivityLogsApi.getAll(requestParams);
      setActivityLogs(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || null);
      setStats(result.meta?.stats || { total: 0, byActionType: {} });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [
    params?.page,
    params?.pageSize,
    params?.actionType,
    params?.entityType,
    params?.userId,
    params?.search,
    params?.sortBy,
    params?.sortOrder,
  ]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return {
    activityLogs,
    pagination,
    stats,
    loading,
    error,
    refresh: fetchActivityLogs,
  };
}
