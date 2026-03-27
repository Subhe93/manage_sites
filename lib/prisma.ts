import { PrismaClient } from '@prisma/client';
import { getRequestContext } from './api/request-context';

const ACTIVITY_ACTIONS = new Set(['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany']);

function toModelDelegate(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function toEntityType(model: string): string {
  switch (model) {
    case 'Website':
      return 'website';
    case 'Domain':
      return 'domain';
    case 'Server':
      return 'server';
    case 'Client':
      return 'client';
    case 'SslCertificate':
      return 'ssl';
    case 'Backup':
      return 'backup';
    default:
      return 'other';
  }
}

function toActionType(action: string): 'create' | 'update' | 'delete' {
  if (action === 'create' || action === 'createMany') return 'create';
  if (action === 'delete' || action === 'deleteMany') return 'delete';
  return 'update';
}

function resolveEntityName(record: any): string | null {
  if (!record || typeof record !== 'object') return null;

  return (
    record.domainName ||
    record.websiteName ||
    record.serverName ||
    record.clientName ||
    record.providerName ||
    record.accountName ||
    record.username ||
    record.fieldLabel ||
    record.name ||
    null
  );
}

function isTrackable(params: { model?: string; action: string }): boolean {
  return Boolean(params.model && params.model !== 'ActivityLog' && ACTIVITY_ACTIONS.has(params.action));
}

// Singleton pattern لـ Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

const prismaWithMiddlewareFlag = globalForPrisma as unknown as {
  __activityMiddlewareRegistered?: boolean;
};

if (!prismaWithMiddlewareFlag.__activityMiddlewareRegistered) {
  prisma.$use(async (params, next) => {
    if (!isTrackable(params)) {
      return next(params);
    }

    const model = params.model as string;
    const delegate = toModelDelegate(model);
    const where = (params.args as any)?.where;
    const context = getRequestContext();

    let oldValues: any = null;
    if ((params.action === 'update' || params.action === 'delete') && where) {
      try {
        oldValues = await (prisma as any)[delegate]?.findUnique?.({ where });
      } catch {
        oldValues = null;
      }
    }

    const result = await next(params);

    try {
      const actionType = toActionType(params.action);
      const entityName = resolveEntityName(result) || resolveEntityName(oldValues);
      const entityId = result?.id ?? oldValues?.id ?? null;

      await prisma.activityLog.create({
        data: {
          userId: context?.userId ?? null,
          actionType,
          entityType: toEntityType(model) as any,
          entityId,
          entityName,
          description: `${actionType} ${model}${entityName ? `: ${entityName}` : ''}`,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: result ? JSON.stringify(result) : null,
        },
      });
    } catch (error) {
      console.error('Activity log middleware error:', error);
    }

    return result;
  });

  prismaWithMiddlewareFlag.__activityMiddlewareRegistered = true;
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
