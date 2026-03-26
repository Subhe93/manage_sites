import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const body = await request.json();
    const filters = body.filters || [];

    // Construct Prisma where clause from custom filters array
    const where: any = {};
    if (filters.length > 0) {
      const andConditions = filters.map((f: any) => {
        const { field, operator, value } = f;
        if (!value && operator !== 'isEmpty' && operator !== 'isNotEmpty') return {};

        switch (field) {
          case 'domainName':
          case 'status':
            return { [field]: buildOperator(operator, value) };
          case 'clientName':
            return { client: { clientName: buildOperator(operator, value) } };
          case 'cloudflareAccount':
            return { cloudflareAccount: { accountName: buildOperator(operator, value) } };
          case 'hasWebsite':
            if (value === 'true' || value === true) {
              return { website: { isNot: null } };
            } else {
              return { website: { is: null } };
            }
          // Add more complex fields here as needed
          default:
            return {};
        }
      });
      where.AND = andConditions.filter((c: any) => Object.keys(c).length > 0);
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'clientName') {
      orderBy = { client: { clientName: sortOrder } };
    } else if (sortBy === 'cloudflareAccount') {
      orderBy = { cloudflareAccount: { accountName: sortOrder } };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [domains, total] = await Promise.all([
      prisma.domain.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          client: { select: { id: true, clientName: true } },
          registrar: { select: { id: true, providerName: true } },
          cloudflareAccount: { select: { id: true, accountName: true } },
          website: {
            include: {
              serverAccount: { 
                select: { 
                  username: true, 
                  server: { select: { serverName: true, ipAddress: true } } 
                } 
              },
              googleAnalyticsAccount: { select: { accountName: true } },
              googleSearchConsoleAccount: { select: { accountName: true } },
              googleAdsAccount: { select: { accountName: true } },
              googleTagManagerAccount: { select: { accountName: true } },
              gscProperties: true,
              credentials: {
                where: { credentialType: 'admin' },
                select: { username: true, passwordEncrypted: true, accessUrl: true }
              },
              subdomains: true,
            }
          },
          costs: { take: 1, orderBy: { createdAt: 'desc' } }
        },
      }),
      prisma.domain.count({ where }),
    ]);

    return ApiResponseHelper.successWithPagination(
      domains,
      {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      }
    );
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

function buildOperator(operator: string, value: any) {
  switch (operator) {
    case 'equals': return { equals: value, mode: 'insensitive' };
    case 'contains': return { contains: value, mode: 'insensitive' };
    case 'startsWith': return { startsWith: value, mode: 'insensitive' };
    case 'endsWith': return { endsWith: value, mode: 'insensitive' };
    case 'in': return { in: Array.isArray(value) ? value : [value] };
    default: return { equals: value };
  }
}
