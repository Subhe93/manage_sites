import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = ApiResponseHelper.success({ message: 'Logged out successfully' });

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
