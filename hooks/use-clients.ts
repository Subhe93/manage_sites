import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Client {
  id: number;
  clientName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  status: string;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    username: string;
    fullName: string | null;
  };
  _count?: {
    domains: number;
    websites: number;
  };
}

export interface ClientFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  country?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useClients(filters: ClientFilters = {}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.country) params.append('country', filters.country);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/clients?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch clients');
      }

      setClients(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch clients';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.country,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch: fetchClients,
  };
}

export function useClient(id: number) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/clients/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch client');
      }

      setClient(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch client';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id, fetchClient]);

  return { client, loading, error, refetch: fetchClient };
}

export function useClientMutations() {
  const createClient = async (data: Partial<Client>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create client');
      }

      toast.success('Client created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create client';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateClient = async (id: number, data: Partial<Client>) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update client');
      }

      toast.success('Client updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update client';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete client');
      }

      toast.success('Client deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete client';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClientStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/clients/stats');
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
