import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromCookieHeader } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { EntityType, PermissionLevel, UserRole } from '@prisma/client';

// ─── Permission Level Hierarchy ──────────────────────────────────────────────
const LEVEL_HIERARCHY: PermissionLevel[] = ['view', 'edit', 'admin', 'owner'];

function levelIndex(level: PermissionLevel): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

function hasLevel(userLevel: PermissionLevel, required: PermissionLevel): boolean {
  return levelIndex(userLevel) >= levelIndex(required);
}

// ─── Role-based default permissions ──────────────────────────────────────────
// super_admin & admin bypass all permission checks
const BYPASS_ROLES: UserRole[] = ['super_admin', 'admin'];

// Roles that get implicit view access to everything
const IMPLICIT_VIEW_ROLES: UserRole[] = ['super_admin', 'admin', 'developer'];

// ─── Section-to-EntityType mapping ───────────────────────────────────────────
export const SECTION_ENTITY_MAP: Record<string, EntityType | null> = {
  dashboard: null,       // everyone can see dashboard
  overview: null,        // everyone can see overview
  clients: 'client',
  domains: 'domain',
  servers: 'server',
  websites: 'website',
  providers: 'providers',
  cloudflare: 'cloudflare',
  google: 'google',
  uptime: 'uptime',
  notifications: 'notifications',
  activity: 'activity',
  users: 'users',
  permissions: 'permissions',
  settings: 'settings',
  tags: 'other',
};

// ─── Sidebar sections with required permissions ──────────────────────────────
export interface SidebarPermission {
  section: string;
  requiredLevel: PermissionLevel;
  adminOnly?: boolean;
}

export const SIDEBAR_PERMISSIONS: SidebarPermission[] = [
  { section: 'dashboard', requiredLevel: 'view' },
  { section: 'overview', requiredLevel: 'view' },
  { section: 'clients', requiredLevel: 'view' },
  { section: 'domains', requiredLevel: 'view' },
  { section: 'servers', requiredLevel: 'view' },
  { section: 'websites', requiredLevel: 'view' },
  { section: 'providers', requiredLevel: 'view' },
  { section: 'cloudflare', requiredLevel: 'view' },
  { section: 'google', requiredLevel: 'view' },
  { section: 'uptime', requiredLevel: 'view' },
  { section: 'notifications', requiredLevel: 'view' },
  { section: 'activity', requiredLevel: 'view' },
  { section: 'users', requiredLevel: 'admin', adminOnly: true },
  { section: 'permissions', requiredLevel: 'admin', adminOnly: true },
  { section: 'settings', requiredLevel: 'admin', adminOnly: true },
];

// ─── Core permission checking ────────────────────────────────────────────────

export interface UserPermissionInfo {
  userId: number;
  username: string;
  role: UserRole;
  permissions: {
    entityType: EntityType;
    entityId: number | null;
    permissionLevel: PermissionLevel;
  }[];
}

/**
 * Get authenticated user info + permissions from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserPermissionInfo | null> {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookieHeader(cookieHeader);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const permissions = await prisma.userPermission.findMany({
    where: { userId: payload.userId },
    select: {
      entityType: true,
      entityId: true,
      permissionLevel: true,
    },
  });

  return {
    userId: payload.userId,
    username: payload.username,
    role: payload.role as UserRole,
    permissions,
  };
}

/**
 * Check if a user can access a specific section with the required level
 */
export function canAccess(
  user: UserPermissionInfo,
  entityType: EntityType | null,
  requiredLevel: PermissionLevel = 'view'
): boolean {
  // super_admin and admin bypass all checks
  if (BYPASS_ROLES.includes(user.role)) return true;

  // Null entity type means open to all authenticated users
  if (entityType === null) return true;

  // Check for 'all' entity type permission (wildcard)
  const allPerm = user.permissions.find(p => p.entityType === 'all');
  if (allPerm && hasLevel(allPerm.permissionLevel, requiredLevel)) return true;

  // Check specific entity type permission
  const perm = user.permissions.find(p => p.entityType === entityType && p.entityId === null);
  if (perm && hasLevel(perm.permissionLevel, requiredLevel)) return true;

  // Manager gets implicit view access
  if (requiredLevel === 'view' && IMPLICIT_VIEW_ROLES.includes(user.role)) return true;

  return false;
}

/**
 * Check if user can access a specific entity instance
 */
export function canAccessEntity(
  user: UserPermissionInfo,
  entityType: EntityType,
  entityId: number,
  requiredLevel: PermissionLevel = 'view'
): boolean {
  if (BYPASS_ROLES.includes(user.role)) return true;

  // Check section-level access first
  if (canAccess(user, entityType, requiredLevel)) return true;

  // Check entity-instance-level permission
  const perm = user.permissions.find(
    p => p.entityType === entityType && p.entityId === entityId
  );
  if (perm && hasLevel(perm.permissionLevel, requiredLevel)) return true;

  return false;
}

/**
 * Get all accessible sections for sidebar filtering
 */
export function getAccessibleSections(user: UserPermissionInfo): string[] {
  return SIDEBAR_PERMISSIONS
    .filter(sp => {
      if (sp.adminOnly && !BYPASS_ROLES.includes(user.role)) {
        return canAccess(user, SECTION_ENTITY_MAP[sp.section] ?? null, sp.requiredLevel);
      }
      return canAccess(user, SECTION_ENTITY_MAP[sp.section] ?? null, sp.requiredLevel);
    })
    .map(sp => sp.section);
}

/**
 * Get the effective permission level for a section
 */
export function getEffectiveLevel(
  user: UserPermissionInfo,
  entityType: EntityType | null
): PermissionLevel | null {
  if (BYPASS_ROLES.includes(user.role)) return 'owner';
  if (entityType === null) return 'view';

  // Check 'all' wildcard
  const allPerm = user.permissions.find(p => p.entityType === 'all');
  const specificPerm = user.permissions.find(p => p.entityType === entityType && p.entityId === null);

  const levels = [allPerm?.permissionLevel, specificPerm?.permissionLevel].filter(Boolean) as PermissionLevel[];
  if (levels.length === 0) {
    return IMPLICIT_VIEW_ROLES.includes(user.role) ? 'view' : null;
  }

  // Return the highest level
  return levels.reduce((max, l) => (levelIndex(l) > levelIndex(max) ? l : max));
}

// ─── API Middleware: withPermission ──────────────────────────────────────────

type RouteHandler = (request: NextRequest, context?: any) => Promise<Response>;

interface WithPermissionOptions {
  entityType: EntityType | null;
  requiredLevel: PermissionLevel;
}

/**
 * Wraps an API route handler with permission checking.
 * Usage:
 *   export const GET = withPermission({ entityType: 'client', requiredLevel: 'view' }, handler);
 *   export const POST = withPermission({ entityType: 'client', requiredLevel: 'edit' }, handler);
 */
export function withPermission(
  options: WithPermissionOptions,
  handler: (request: NextRequest, context: any, user: UserPermissionInfo) => Promise<Response>
): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return ApiResponseHelper.unauthorized('Authentication required');
    }

    if (!canAccess(user, options.entityType, options.requiredLevel)) {
      return ApiResponseHelper.forbidden(
        'You do not have permission to perform this action'
      );
    }

    return handler(request, context, user);
  };
}
