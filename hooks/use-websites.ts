import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Website {
  id: number;
  websiteName: string;
  domainId: number | null;
  clientId: number | null;
  serverId: number | null;
  serverAccountId: number | null;
  googleAdsAccountId: number | null;
  googleAnalyticsAccountId: number | null;
  googleSearchConsoleAccountId: number | null;
  googleTagManagerAccountId: number | null;
  websiteType: string;
  framework: string | null;
  environment: string;
  websiteUrl: string | null;
  adminUrl: string | null;
  apiEndpoint: string | null;
  databaseName: string | null;
  databaseType: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  domain?: {
    id: number;
    domainName: string;
  };
  client?: {
    id: number;
    clientName: string;
  };
  server?: {
    id: number;
    serverName: string;
  };
  serverAccount?: {
    id: number;
    username: string;
    server?: {
      id: number;
      serverName: string;
    };
  };
  googleAdsAccount?: {
    id: number;
    accountName: string;
  };
  googleAnalyticsAccount?: {
    id: number;
    accountName: string;
  };
  googleSearchConsoleAccount?: {
    id: number;
    accountName: string;
  };
  googleTagManagerAccount?: {
    id: number;
    accountName: string;
  };
  _count?: {
    credentials: number;
    costs: number;
    uptimeChecks: number;
  };
  credentials?: {
    id: number;
    credentialType: string;
    username: string | null;
    passwordEncrypted: string | null;
    accessUrl: string | null;
  }[];
  subdomains?: {
    id?: number;
    subdomainName: string;
    fullUrl: string | null;
    websiteType: string;
    framework: string | null;
    adminUrl: string | null;
    adminUsername: string | null;
    adminPassword: string | null;
    notes: string | null;
  }[];
  customFieldValues?: {
    id: number;
    fieldDefinitionId: number;
    fieldValue: string;
    fieldDefinition: {
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
    }
  }[];
}

export interface WebsiteFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: number;
  type?: string;
  environment?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useWebsites(filters: WebsiteFilters = {}) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.clientId) params.append('clientId', filters.clientId.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.environment) params.append('environment', filters.environment);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/websites?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch websites');
      }

      setWebsites(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch websites';
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
    filters.type,
    filters.environment,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  return {
    websites,
    loading,
    error,
    pagination,
    refetch: fetchWebsites,
  };
}

export function useWebsite(id: number) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/websites/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch website');
      }

      setWebsite(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch website';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWebsite();
    }
  }, [id, fetchWebsite]);

  return { website, loading, error, refetch: fetchWebsite };
}

export function useWebsiteMutations() {
  const createWebsite = async (data: Partial<Website>) => {
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create website');
      }

      toast.success('Website created successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create website';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateWebsite = async (id: number, data: Partial<Website>) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update website');
      }

      toast.success('Website updated successfully');
      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update website';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteWebsite = async (id: number) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete website');
      }

      toast.success('Website deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete website';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createWebsite,
    updateWebsite,
    deleteWebsite,
  };
}

export function useWebsiteStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/websites/stats');
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
