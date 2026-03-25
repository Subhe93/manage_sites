/**
 * Custom React Hooks للتعامل مع الـ APIs
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DomainsApi, WebsitesApi } from '@/lib/api/client';

/**
 * Hook لجلب النطاقات
 */
export function useDomains(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: number;
}) {
  const [domains, setDomains] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DomainsApi.getAll(params);
      setDomains(result.data || []);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.pageSize, params?.status, params?.clientId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const refresh = () => {
    fetchDomains();
  };

  return {
    domains,
    pagination,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook لجلب نطاق معين
 */
export function useDomain(id: number) {
  const [domain, setDomain] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await DomainsApi.getById(id);
        setDomain(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDomain();
    }
  }, [id]);

  return { domain, loading, error };
}

/**
 * Hook لإنشاء/تحديث/حذف نطاق
 */
export function useDomainMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDomain = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await DomainsApi.create(data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDomain = async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await DomainsApi.update(id, data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDomain = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await DomainsApi.delete(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createDomain,
    updateDomain,
    deleteDomain,
    loading,
    error,
  };
}

/**
 * Hook لإحصائيات النطاقات
 */
export function useDomainStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await DomainsApi.getStats();
        setStats(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook لجلب المواقع
 */
export function useWebsites(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: number;
  type?: string;
  environment?: string;
  search?: string;
}) {
  const [websites, setWebsites] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await WebsitesApi.getAll(params);
      setWebsites(result.data || []);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    params?.page,
    params?.pageSize,
    params?.status,
    params?.clientId,
    params?.type,
    params?.environment,
    params?.search,
  ]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const refresh = () => {
    fetchWebsites();
  };

  return {
    websites,
    pagination,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook لجلب موقع معين
 */
export function useWebsite(id: number) {
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await WebsitesApi.getById(id);
        setWebsite(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWebsite();
    }
  }, [id]);

  return { website, loading, error };
}

/**
 * Hook لإنشاء/تحديث/حذف موقع
 */
export function useWebsiteMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWebsite = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await WebsitesApi.create(data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWebsite = async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await WebsitesApi.update(id, data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWebsite = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await WebsitesApi.delete(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createWebsite,
    updateWebsite,
    deleteWebsite,
    loading,
    error,
  };
}
