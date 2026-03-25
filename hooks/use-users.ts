/**
 * Custom React Hooks للمستخدمين
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UsersApi } from '@/lib/api/client';

/**
 * Hook لجلب المستخدمين
 */
export function useUsers(params?: {
  page?: number;
  pageSize?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await UsersApi.getAll(params);
      setUsers(result.data || []);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.pageSize, params?.role, params?.isActive, params?.search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refresh = () => {
    fetchUsers();
  };

  return {
    users,
    pagination,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook لجلب مستخدم معين
 */
export function useUser(id: number) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await UsersApi.getById(id);
        setUser(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  return { user, loading, error };
}

/**
 * Hook لإنشاء/تحديث/حذف مستخدم
 */
export function useUserMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await UsersApi.create(data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await UsersApi.update(id, data);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await UsersApi.delete(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    updateUser,
    deleteUser,
    loading,
    error,
  };
}

/**
 * Hook لإحصائيات المستخدمين
 */
export function useUserStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await UsersApi.getStats();
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
