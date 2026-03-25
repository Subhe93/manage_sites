import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Permission {
  id: number;
  userId: number;
  entityType: string;
  entityId: number | null;
  permissionLevel: string;
  grantedAt: string;
  grantedBy: number | null;
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    role: string;
  };
  granter?: {
    id: number;
    username: string;
    fullName: string | null;
  };
}

export interface PermissionFilters {
  page?: number;
  pageSize?: number;
  userId?: number;
  entityType?: string;
  permissionLevel?: string;
  search?: string;
}

export interface PermissionStats {
  total: number;
  byLevel: Record<string, number>;
  byEntityType: Record<string, number>;
}

export function usePermissions(filters: PermissionFilters = {}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.permissionLevel) params.append('permissionLevel', filters.permissionLevel);
      if (filters.search) params.append('search', filters.search);

      const response = await ApiClient.get(`/permissions?${params.toString()}`);
      setPermissions(response.data?.permissions || []);
      setPagination(response.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch permissions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.pageSize,
    filters.userId,
    filters.entityType,
    filters.permissionLevel,
    filters.search,
  ]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    pagination,
    refetch: fetchPermissions,
  };
}

export function usePermission(id: number) {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.get(`/permissions/${id}`);
      setPermission(response.data as Permission);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch permission';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPermission();
    }
  }, [id, fetchPermission]);

  return { permission, loading, error, refetch: fetchPermission };
}

export function usePermissionMutations() {
  const createPermission = async (data: Partial<Permission>) => {
    try {
      const response = await ApiClient.post('/permissions', data);
      toast.success('Permission created successfully');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updatePermission = async (id: number, data: Partial<Permission>) => {
    try {
      const response = await ApiClient.put(`/permissions/${id}`, data);
      toast.success('Permission updated successfully');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deletePermission = async (id: number) => {
    try {
      await ApiClient.delete(`/permissions/${id}`);
      toast.success('Permission deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete permission';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createPermission,
    updatePermission,
    deletePermission,
  };
}

export function usePermissionStats() {
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.get('/permissions/stats');
      setStats(response.data as PermissionStats);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch stats';
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
