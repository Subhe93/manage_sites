import { BaseRepository } from '../base-repository';
import { Prisma, UserPermission, EntityType, PermissionLevel } from '@prisma/client';

export interface PermissionFilters {
  userId?: number;
  entityType?: EntityType;
  permissionLevel?: PermissionLevel;
  search?: string;
}

export class PermissionRepository extends BaseRepository<UserPermission> {
  constructor() {
    super('userPermission');
  }

  async findAllWithFilters(
    filters: PermissionFilters,
    page: number = 1,
    pageSize: number = 10
  ) {
    const where: Prisma.UserPermissionWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.permissionLevel) {
      where.permissionLevel = filters.permissionLevel;
    }

    if (filters.search) {
      where.OR = [
        {
          user: {
            OR: [
              { username: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { fullName: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return this.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        granter: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async countWithFilters(filters: PermissionFilters) {
    const where: Prisma.UserPermissionWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.permissionLevel) {
      where.permissionLevel = filters.permissionLevel;
    }

    if (filters.search) {
      where.OR = [
        {
          user: {
            OR: [
              { username: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { fullName: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return this.count({ where });
  }

  async findByIdWithRelations(id: number) {
    return this.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        granter: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [total, byLevel, byEntityType] = await Promise.all([
      this.count({}),
      this.prisma.userPermission.groupBy({
        by: ['permissionLevel'],
        _count: true,
      }),
      this.prisma.userPermission.groupBy({
        by: ['entityType'],
        _count: true,
      }),
    ]);

    return {
      total,
      byLevel: byLevel.reduce((acc, item) => {
        acc[item.permissionLevel] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byEntityType: byEntityType.reduce((acc, item) => {
        acc[item.entityType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async checkPermission(
    userId: number,
    entityType: EntityType,
    entityId: number | null,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const permission = await this.findFirst({
      where: {
        userId,
        entityType,
        entityId,
      },
    });

    if (!permission) return false;

    const levels: PermissionLevel[] = ['view', 'edit', 'admin', 'owner'];
    const userLevelIndex = levels.indexOf(permission.permissionLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    return userLevelIndex >= requiredLevelIndex;
  }
}
