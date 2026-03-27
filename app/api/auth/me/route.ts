import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/lib/api/response';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return ApiResponseHelper.unauthorized('Not authenticated');
  }

  const payload = verifyToken(token);

  if (!payload) {
    return ApiResponseHelper.unauthorized('Invalid or expired token');
  }

  return ApiResponseHelper.success({
    user: {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    },
  });
}
