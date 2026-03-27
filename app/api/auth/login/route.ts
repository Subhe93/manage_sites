import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { createToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
        ],
        isActive: true,
      },
    });

    if (!user) {
      return ApiResponseHelper.error('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Dynamic import bcrypt (it's a devDependency but available at runtime)
    let bcrypt: any;
    try {
      bcrypt = require('bcrypt');
    } catch {
      // Fallback: simple comparison for development if bcrypt is not available
      if (user.passwordHash !== password) {
        return ApiResponseHelper.error('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
    }

    if (bcrypt) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return ApiResponseHelper.error('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = createToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = ApiResponseHelper.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponseHelper.validationError(
        error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      );
    }
    console.error('Login error:', error);
    return ApiResponseHelper.serverError('Login failed');
  }
}
