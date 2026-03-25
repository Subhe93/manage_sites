import { NextRequest } from 'next/server';
import { userRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

/**
 * GET /api/users
 * جلب جميع المستخدمين مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const role = searchParams.get('role');
  const isActive = searchParams.get('isActive');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  // بناء شروط البحث
  const where: any = {};
  
  // فقط إضافة role إذا كان موجوداً وليس 'all' أو 'undefined'
  if (role && role !== 'all' && role !== 'undefined') {
    where.role = role;
  }
  
  // فقط إضافة isActive إذا كان موجوداً وليس 'all' أو 'undefined'
  if (isActive && isActive !== 'all' && isActive !== 'undefined') {
    where.isActive = isActive === 'true';
  }
  
  // فقط إضافة البحث إذا كان موجوداً وليس فارغاً أو 'undefined'
  if (search && search.trim() !== '' && search !== 'undefined') {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // بناء orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const result = await userRepository.paginate({
    page,
    pageSize,
    where,
    orderBy,
    include: {
      _count: {
        select: {
          createdClients: true,
          permissions: true,
          activityLogs: true,
        },
      },
    },
  });

  // إزالة passwordHash من النتائج
  const sanitizedData = result.data.map(({ passwordHash, ...user }) => user);

  return ApiResponseHelper.successWithPagination(sanitizedData, result.pagination);
});

/**
 * POST /api/users
 * إنشاء مستخدم جديد
 */
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'developer', 'client', 'viewer']),
  isActive: z.boolean().default(true),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createUserSchema.parse(body);

  // التحقق من عدم وجود مستخدم بنفس البريد أو اسم المستخدم
  const existingEmail = await userRepository.findByEmail(validatedData.email);
  if (existingEmail) {
    return ApiResponseHelper.error('Email already exists', 409, 'DUPLICATE_EMAIL');
  }

  const existingUsername = await userRepository.findByUsername(validatedData.username);
  if (existingUsername) {
    return ApiResponseHelper.error('Username already exists', 409, 'DUPLICATE_USERNAME');
  }

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  const user = await userRepository.create({
    username: validatedData.username,
    email: validatedData.email,
    passwordHash: hashedPassword,
    fullName: validatedData.fullName,
    role: validatedData.role,
    isActive: validatedData.isActive,
  });

  // إزالة passwordHash من النتيجة
  const { passwordHash, ...sanitizedUser } = user;

  return ApiResponseHelper.created(sanitizedUser);
});
