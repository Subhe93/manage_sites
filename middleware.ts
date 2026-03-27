import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirect to login for page requests
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Return 401 for API requests
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  // Basic token structure validation (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json(
      { success: false, error: { message: 'Invalid token', code: 'INVALID_TOKEN' } },
      { status: 401 }
    );
  }

  // Check token expiry from payload
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const response = !pathname.startsWith('/api/')
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.json(
            { success: false, error: { message: 'Token expired', code: 'TOKEN_EXPIRED' } },
            { status: 401 }
          );
      response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
      return response;
    }
  } catch {
    // If payload can't be parsed, let the API-level verification handle it
  }

  // If user is authenticated and trying to access /login, redirect to home
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
