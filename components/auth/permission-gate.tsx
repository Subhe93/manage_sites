'use client';

import React from 'react';
import { useUserPermissions } from '@/hooks/use-user-permissions';

interface PermissionGateProps {
  section: string;
  level?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on user's permission level for a section.
 * Usage:
 *   <PermissionGate section="clients" level="edit">
 *     <Button>Edit Client</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ section, level = 'view', children, fallback = null }: PermissionGateProps) {
  const { hasPermission, loading } = useUserPermissions();

  if (loading) return null;

  if (!hasPermission(section, level)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Only renders children if user is admin or super_admin
 */
export function AdminGate({ children, fallback = null }: AdminGateProps) {
  const { isAdmin, loading } = useUserPermissions();

  if (loading) return null;
  if (!isAdmin) return <>{fallback}</>;

  return <>{children}</>;
}
