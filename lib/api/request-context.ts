import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  userId: number | null;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

function parseUserId(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getUserIdFromRequest(req: Request): number | null {
  const headerUserId = req.headers.get('x-user-id') || req.headers.get('x-actor-user-id');
  return parseUserId(headerUserId);
}

export async function withRequestContext<T>(req: Request, callback: () => Promise<T>): Promise<T> {
  const userId = getUserIdFromRequest(req);
  return requestContextStorage.run({ userId }, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
