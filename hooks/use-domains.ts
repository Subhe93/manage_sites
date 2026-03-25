import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Domain {
  id: number;
  domainName: string;
  tld: string | null;
  status: string;
  registrarId: number | null;
  clientId: number | null;
  registrationDate: string | null;
  expiryDate: string | null;
  autoRenew: boolean;
  renewalNotificationDays: number;
  whoisPrivacy: boolean;
  nameservers: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: number;
    clientName: string;
    companyName: string | null;
  };
  registrar?: {
    id: number;
    providerName: string;
    providerType: string;
  };
  _count?: {
    costs: number;
    websites: number;
  };
}

export interface DomainFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: number;
  registrarId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useDomains(filters: DomainFilters = {}) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId.toString());
      if (filters.registrarId) params.append('registrarId', filters.registrarId.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/domains?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch domains');
      }

      setDomains(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch domains';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.clientId,
    filters.registrarId,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    domains,
    loading,
    error,
    pagination,
    refetch: fetchDomains,
  };
}

export function useDomain(id: number) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDomain = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/domains/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch domain');
      }

      setDomain(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch domain';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDomain();
    }
  }, [id, fetchDomain]);

  return { domain, loading, error, refetch: fetchDomain };
}

export function useDomainMutations() {
  const createDomain = async (data: Partial<Domain>) => {
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create domain');
      }

      toast.success('Domain created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create domain';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateDomain = async (id: number, data: Partial<Domain>) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update domain');
      }

      toast.success('Domain updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update domain';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteDomain = async (id: number) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete domain');
      }

      toast.success('Domain deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete domain';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createDomain,
    updateDomain,
    deleteDomain,
  };
}

export function useDomainStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/domains/stats');
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
