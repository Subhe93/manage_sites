import { NextRequest } from 'next/server';
import { userRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

/**
 * GET /api/users/[id]
 * جلب مستخدم معين مع صلاحياته
 */
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    const user = await userRepository.findWithPermissions(id);

    if (!user) {
      return ApiResponseHelper.notFound('User not found');
    }

    // إزالة passwordHash
    const { passwordHash, ...sanitizedUser } = user;

    return ApiResponseHelper.success(sanitizedUser);
  }
);

/**
 * PUT /api/users/[id]
 * تحديث مستخدم
 */
const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  fullName: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'developer', 'client', 'viewer']).optional(),
  isActive: z.boolean().optional(),
});

export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // التحقق من وجود المستخدم
    const existing = await userRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('User not found');
    }

    // التحقق من البريد الإلكتروني إذا تم تغييره
    if (validatedData.email && validatedData.email !== existing.email) {
      const existingEmail = await userRepository.findByEmail(validatedData.email);
      if (existingEmail) {
        return ApiResponseHelper.error('Email already exists', 409, 'DUPLICATE_EMAIL');
      }
    }

    // التحقق من اسم المستخدم إذا تم تغييره
    if (validatedData.username && validatedData.username !== existing.username) {
      const existingUsername = await userRepository.findByUsername(validatedData.username);
      if (existingUsername) {
        return ApiResponseHelper.error('Username already exists', 409, 'DUPLICATE_USERNAME');
      }
    }

    // تحضير البيانات للتحديث
    const updateData: any = { ...validatedData };

    // تشفير كلمة المرور إذا تم تغييرها
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
      delete updateData.password;
    }

    const user = await userRepository.update(id, updateData);

    // إزالة passwordHash
    const { passwordHash, ...sanitizedUser } = user;

    return ApiResponseHelper.success(sanitizedUser);
  }
);

/**
 * DELETE /api/users/[id]
 * حذف مستخدم
 */
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = parseInt(params.id);

    // التحقق من وجود المستخدم
    const existing = await userRepository.findById(id);
    if (!existing) {
      return ApiResponseHelper.notFound('User not found');
    }

    await userRepository.delete(id);

    return ApiResponseHelper.noContent();
  }
);
