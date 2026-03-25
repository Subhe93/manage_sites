import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ServiceProvider {
  id: number;
  providerName: string;
  providerType: string;
  websiteUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  apiEndpoint: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    domains: number;
    servers: number;
  };
}

export interface ProviderFilters {
  page?: number;
  pageSize?: number;
  providerType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useProviders(filters: ProviderFilters = {}) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.providerType) params.append('providerType', filters.providerType);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/providers?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch providers');
      }

      setProviders(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch providers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.pageSize,
    filters.providerType,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    pagination,
    refetch: fetchProviders,
  };
}

export function useProvider(id: number) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProvider = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/providers/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch provider');
      }

      setProvider(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch provider';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id, fetchProvider]);

  return { provider, loading, error, refetch: fetchProvider };
}

export function useProviderMutations() {
  const createProvider = async (data: Partial<ServiceProvider>) => {
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create provider');
      }

      toast.success('Provider created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create provider';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateProvider = async (id: number, data: Partial<ServiceProvider>) => {
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update provider');
      }

      toast.success('Provider updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update provider';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteProvider = async (id: number) => {
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete provider');
      }

      toast.success('Provider deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete provider';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createProvider,
    updateProvider,
    deleteProvider,
  };
}

export function useProviderStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/providers/stats');
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
