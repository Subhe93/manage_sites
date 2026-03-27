'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface UserPermissions {
  userId: number;
  username: string;
  role: string;
  accessibleSections: string[];
  sectionLevels: Record<string, string | null>;
  permissions: {
    entityType: string;
    entityId: number | null;
    permissionLevel: string;
  }[];
}

interface PermissionsState {
  data: UserPermissions | null;
  loading: boolean;
  error: string | null;
}

const LEVEL_HIERARCHY = ['view', 'edit', 'admin', 'owner'];

function levelIndex(level: string): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

export function useUserPermissions() {
  const [state, setState] = useState<PermissionsState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchPermissions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await fetch('/api/auth/me/permissions');
      const json = await res.json();
      if (json.success) {
        setState({ data: json.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: json.error?.message || 'Failed' });
      }
    } catch {
      setState({ data: null, loading: false, error: 'Failed to fetch permissions' });
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user can see a section in sidebar
   */
  const canViewSection = useCallback((section: string): boolean => {
    if (!state.data) return false;
    // super_admin and admin see everything
    if (['super_admin', 'admin'].includes(state.data.role)) return true;
    return state.data.accessibleSections.includes(section);
  }, [state.data]);

  /**
   * Check if user has at least the given permission level for a section
   */
  const hasPermission = useCallback((section: string, requiredLevel: string = 'view'): boolean => {
    if (!state.data) return false;
    if (['super_admin', 'admin'].includes(state.data.role)) return true;

    const level = state.data.sectionLevels[section];
    if (!level) return false;

    return levelIndex(level) >= levelIndex(requiredLevel);
  }, [state.data]);

  /**
   * Check if user can edit in a section
   */
  const canEdit = useCallback((section: string): boolean => {
    return hasPermission(section, 'edit');
  }, [hasPermission]);

  /**
   * Check if user can delete/admin in a section
   */
  const canAdmin = useCallback((section: string): boolean => {
    return hasPermission(section, 'admin');
  }, [hasPermission]);

  /**
   * Check if user is super_admin or admin role
   */
  const isAdmin = state.data ? ['super_admin', 'admin'].includes(state.data.role) : false;

  return {
    ...state,
    permissions: state.data,
    isAdmin,
    canViewSection,
    hasPermission,
    canEdit,
    canAdmin,
    refetch: fetchPermissions,
  };
}
