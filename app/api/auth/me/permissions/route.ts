import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { getUserFromRequest, getAccessibleSections, getEffectiveLevel, SECTION_ENTITY_MAP } from '@/lib/permissions';
import { EntityType } from '@prisma/client';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return ApiResponseHelper.unauthorized('Not authenticated');
  }

  // Build section-level access map
  const accessibleSections = getAccessibleSections(user);
  const sectionLevels: Record<string, string | null> = {};

  for (const [section, entityType] of Object.entries(SECTION_ENTITY_MAP)) {
    sectionLevels[section] = getEffectiveLevel(user, entityType);
  }

  return ApiResponseHelper.success({
    userId: user.userId,
    username: user.username,
    role: user.role,
    accessibleSections,
    sectionLevels,
    permissions: user.permissions.map(p => ({
      entityType: p.entityType,
      entityId: p.entityId,
      permissionLevel: p.permissionLevel,
    })),
  });
}
