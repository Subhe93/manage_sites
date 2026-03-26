import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Server {
  id: number;
  serverName: string;
  providerId: number | null;
  serverType: string;
  ipAddress: string | null;
  location: string | null;
  operatingSystem: string | null;
  controlPanel: string | null;
  controlPanelUrl: string | null;
  cpuCores: number | null;
  ramGb: number | null;
  storageGb: number | null;
  bandwidthGb: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: number;
    providerName: string;
    providerType: string;
  };
  _count?: {
    accounts: number;
    costs: number;
    monitoring: number;
    websites: number;
  };
}

export interface ServerFilters {
  page?: number;
  pageSize?: number;
  serverType?: string;
  status?: string;
  providerId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useServers(filters: ServerFilters = {}) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.serverType) params.append('serverType', filters.serverType);
      if (filters.status) params.append('status', filters.status);
      if (filters.providerId) params.append('providerId', filters.providerId.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/servers?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch servers');
      }

      setServers(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch servers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.pageSize,
    filters.serverType,
    filters.status,
    filters.providerId,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return {
    servers,
    loading,
    error,
    pagination,
    refetch: fetchServers,
  };
}

export function useServer(id: number) {
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/servers/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch server');
      }

      setServer(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch server';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchServer();
    }
  }, [id, fetchServer]);

  return { server, loading, error, refetch: fetchServer };
}

export function useServerMutations() {
  const createServer = async (data: Partial<Server>) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create server');
      }

      toast.success('Server created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create server';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateServer = async (id: number, data: Partial<Server>) => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update server');
      }

      toast.success('Server updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update server';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteServer = async (id: number) => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete server');
      }

      toast.success('Server deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete server';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createServer,
    updateServer,
    deleteServer,
  };
}

export function useServerStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/servers/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch stats');
      }

      setStats(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
