import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'manage-sites-secret-key-change-in-production-2024';
const TOKEN_EXPIRY_HOURS = 24;

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
}

function sign(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + TOKEN_EXPIRY_HOURS * 3600,
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function verify(token: string): (TokenPayload & { iat: number; exp: number }) | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = 'auth_token';

export function createToken(payload: TokenPayload): string {
  return sign(payload);
}

export function verifyToken(token: string): TokenPayload | null {
  return verify(token);
}

export function getTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}
