import { User, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereInput
> {
  protected model = prisma.user;

  /**
   * جلب مستخدم بالبريد الإلكتروني
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  /**
   * جلب مستخدم باسم المستخدم
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.model.findUnique({
      where: { username },
    });
  }

  /**
   * جلب المستخدمين النشطين فقط
   */
  async findActiveUsers() {
    return this.model.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * جلب مستخدم مع صلاحياته
   */
  async findWithPermissions(id: number) {
    return this.model.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            granter: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
        notificationSettings: true,
      },
    });
  }

  /**
   * تحديث آخر تسجيل دخول
   */
  async updateLastLogin(id: number) {
    return this.model.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * تعطيل/تفعيل مستخدم
   */
  async toggleActive(id: number, isActive: boolean) {
    return this.model.update({
      where: { id },
      data: { isActive },
    });
  }
}

// Singleton instance
export const userRepository = new UserRepository();
