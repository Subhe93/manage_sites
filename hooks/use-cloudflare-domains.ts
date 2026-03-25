import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
export interface CloudflareDomainRecord {
    id: number;
    domainId: number;
    cloudflareAccountId: number;
    zoneId: string | null;
    nameservers: string | null;
    sslMode: string;
    cacheLevel: string;
    securityLevel: string;
    isActive: boolean;
    activatedAt: string;
    createdAt: string;
    updatedAt: string;
    domain?: {
        id: number;
        domainName: string;
        status: string;
    };
    cloudflareAccount?: {
        id: number;
        accountName: string;
        accountEmail: string;
    };
}
export interface CloudflareDomainFilters {
    page?: number;
    pageSize?: number;
    cloudflareAccountId?: number;
    sslMode?: string;
    isActive?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export function useCloudflareDomains(filters: CloudflareDomainFilters = {}) {
    const [domains, setDomains] = useState<CloudflareDomainRecord[]>([]);
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
            if (filters.cloudflareAccountId) params.append('cloudflareAccountId', filters.cloudflareAccountId.toString());
            if (filters.sslMode) params.append('sslMode', filters.sslMode);
            if (filters.isActive) params.append('isActive', filters.isActive);
            if (filters.search) params.append('search', filters.search);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            const response = await fetch(`/api/cloudflare/domains?${params.toString()}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to fetch Cloudflare domains');
            }
            setDomains(Array.isArray(result.data) ? result.data : []);
            setPagination(result.pagination || {
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch Cloudflare domains';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [
        filters.page,
        filters.pageSize,
        filters.cloudflareAccountId,
        filters.sslMode,
        filters.isActive,
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
export function useCloudflareDomain(id: number) {
    const [domain, setDomain] = useState<CloudflareDomainRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchDomain = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/cloudflare/domains/${id}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to fetch Cloudflare domain');
            }
            setDomain(result.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch Cloudflare domain';
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
export function useCloudflareDomainMutations() {
    const createDomain = async (data: any) => {
        try {
            const response = await fetch('/api/cloudflare/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to create Cloudflare domain');
            }
            toast.success('Cloudflare domain created successfully');
            return result.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create Cloudflare domain';
            toast.error(errorMessage);
            throw err;
        }
    };
    const updateDomain = async (id: number, data: any) => {
        try {
            const response = await fetch(`/api/cloudflare/domains/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to update Cloudflare domain');
            }
            toast.success('Cloudflare domain updated successfully');
            return result.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update Cloudflare domain';
            toast.error(errorMessage);
            throw err;
        }
    };
    const deleteDomain = async (id: number) => {
        try {
            const response = await fetch(`/api/cloudflare/domains/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error?.message || 'Failed to delete Cloudflare domain');
            }
            toast.success('Cloudflare domain deleted successfully');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete Cloudflare domain';
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
export function useCloudflareDomainStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/cloudflare/domains/stats');
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
