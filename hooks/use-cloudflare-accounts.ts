import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
export interface CloudflareAccount {
    id: number;
    accountName: string;
    accountEmail: string;
    accountId: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        domains: number;
        linkedDomains: number;
    };
    domains?: any[];
}
export interface CloudflareAccountFilters {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export function useCloudflareAccounts(filters: CloudflareAccountFilters = {}) {
    const [accounts, setAccounts] = useState<CloudflareAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });
    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            const response = await fetch(`/api/cloudflare/accounts?${params.toString()}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to fetch Cloudflare accounts');
            }
            setAccounts(Array.isArray(result.data) ? result.data : []);
            setPagination(result.pagination || {
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch Cloudflare accounts';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [
        filters.page,
        filters.pageSize,
        filters.status,
        filters.search,
        filters.sortBy,
        filters.sortOrder,
    ]);
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);
    return {
        accounts,
        loading,
        error,
        pagination,
        refetch: fetchAccounts,
    };
}
export function useCloudflareAccount(id: number) {
    const [account, setAccount] = useState<CloudflareAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchAccount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/cloudflare/accounts/${id}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to fetch Cloudflare account');
            }
            setAccount(result.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch Cloudflare account';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        if (id) {
            fetchAccount();
        }
    }, [id, fetchAccount]);
    return { account, loading, error, refetch: fetchAccount };
}
export function useCloudflareAccountMutations() {
    const createAccount = async (data: Partial<CloudflareAccount>) => {
        try {
            const response = await fetch('/api/cloudflare/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to create Cloudflare account');
            }
            toast.success('Cloudflare account created successfully');
            return result.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create Cloudflare account';
            toast.error(errorMessage);
            throw err;
        }
    };
    const updateAccount = async (id: number, data: Partial<CloudflareAccount>) => {
        try {
            const response = await fetch(`/api/cloudflare/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to update Cloudflare account');
            }
            toast.success('Cloudflare account updated successfully');
            return result.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update Cloudflare account';
            toast.error(errorMessage);
            throw err;
        }
    };
    const deleteAccount = async (id: number) => {
        try {
            const response = await fetch(`/api/cloudflare/accounts/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error?.message || 'Failed to delete Cloudflare account');
            }
            toast.success('Cloudflare account deleted successfully');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete Cloudflare account';
            toast.error(errorMessage);
            throw err;
        }
    };
    return {
        createAccount,
        updateAccount,
        deleteAccount,
    };
}
export function useCloudflareAccountStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/cloudflare/accounts/stats');
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
