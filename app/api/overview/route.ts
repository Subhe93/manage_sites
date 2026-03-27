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
    
    // Support global search
    const globalSearch = body.globalSearch;
    if (globalSearch) {
      where.OR = [
        { domainName: { contains: globalSearch, mode: 'insensitive' } },
        { client: { clientName: { contains: globalSearch, mode: 'insensitive' } } },
        { cloudflareAccount: { accountName: { contains: globalSearch, mode: 'insensitive' } } },
        { website: { websiteName: { contains: globalSearch, mode: 'insensitive' } } },
        { website: { websiteUrl: { contains: globalSearch, mode: 'insensitive' } } },
        { website: { adminUrl: { contains: globalSearch, mode: 'insensitive' } } },
        { website: { server: { serverName: { contains: globalSearch, mode: 'insensitive' } } } },
        { website: { server: { ipAddress: { contains: globalSearch, mode: 'insensitive' } } } },
      ];
    }

    if (filters.length > 0) {
      const andConditions = filters.map((f: any) => {
        const { field, operator, value } = f;
        
        // Handle isEmpty/isNotEmpty operators
        if (operator === 'isEmpty' || operator === 'isNotEmpty') {
          return buildEmptyFilter(field, operator === 'isEmpty');
        }
        
        if (!value) return {};

        switch (field) {
          case 'domainName':
            return { domainName: buildOperator(operator, value) };
          case 'status':
            return { status: buildOperator(operator, value, true) };
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
          case 'websiteName':
            return { website: { websiteName: buildOperator(operator, value) } };
          case 'websiteType':
            return { website: { websiteType: buildOperator(operator, value, true) } };
          case 'websiteDbName':
            return { website: { databaseName: buildOperator(operator, value) } };
          case 'websiteDbType':
            return { website: { databaseType: buildOperator(operator, value, true) } };
          case 'websiteEnvironment':
            return { website: { environment: buildOperator(operator, value, true) } };
          case 'websiteUrls':
            return { website: { websiteUrl: buildOperator(operator, value) } };
          case 'websiteAdminUrl':
            return { website: { adminUrl: buildOperator(operator, value) } };
          case 'websiteUsername':
            return { website: { credentials: { some: { username: buildOperator(operator, value) } } } };
          case 'serverName':
            return { website: { server: { serverName: buildOperator(operator, value) } } };
          case 'serverIp':
            return { website: { server: { ipAddress: buildOperator(operator, value) } } };
          case 'serverProvider':
            return { website: { server: { provider: { providerName: buildOperator(operator, value) } } } };
          case 'serverType':
            return { website: { server: { serverType: buildOperator(operator, value, true) } } };
          case 'googleAnalytics':
            return { website: { googleAnalyticsAccount: { accountName: buildOperator(operator, value) } } };
          case 'googleSearchConsole':
            return { website: { googleSearchConsoleAccount: { accountName: buildOperator(operator, value) } } };
          case 'googleAds':
            return { website: { googleAdsAccount: { accountName: buildOperator(operator, value) } } };
          case 'tagManager':
            return { website: { googleTagManagerAccount: { accountName: buildOperator(operator, value) } } };
          case 'subdomains':
            return { website: { subdomains: { some: { subdomainName: buildOperator(operator, value) } } } };
          // Handle dynamic custom fields
          default:
            if (field.startsWith('cf_')) {
              const fieldName = field.substring(3);
              return {
                website: {
                  customFieldValues: {
                    some: {
                      fieldDefinition: { fieldName: fieldName },
                      fieldValue: buildOperator(operator, value)
                    }
                  }
                }
              };
            }
            return {};
        }
      });
      where.AND = andConditions.filter((c: any) => Object.keys(c).length > 0);
    }

    // Build orderBy
    let orderBy: any = {};
    const websiteFields: Record<string, string> = {
      websiteName: 'websiteName',
      websiteType: 'websiteType',
      websiteEnvironment: 'environment',
      websiteDbName: 'databaseName',
      websiteDbType: 'databaseType',
    };
    
    if (sortBy === 'clientName') {
      orderBy = { client: { clientName: sortOrder } };
    } else if (sortBy === 'cloudflareAccount') {
      orderBy = { cloudflareAccount: { accountName: sortOrder } };
    } else if (websiteFields[sortBy]) {
      orderBy = { website: { [websiteFields[sortBy]]: sortOrder } };
    } else if (sortBy === 'serverName') {
      // Prisma orderBy doesn't perfectly support deeply nested conditional relations or multiple possible sources.
      // We will sort by direct serverName as a best effort.
      orderBy = { website: { server: { serverName: sortOrder } } };
    } else if (sortBy === 'serverIp') {
      orderBy = { website: { server: { ipAddress: sortOrder } } };
    } else if (sortBy === 'serverProvider') {
      orderBy = { website: { server: { provider: { providerName: sortOrder } } } };
    } else if (sortBy === 'serverType') {
      orderBy = { website: { server: { serverType: sortOrder } } };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [domains, total, availableCustomFields] = await Promise.all([
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
              server: {
                include: {
                  provider: true
                }
              },
              serverAccount: { 
                select: { 
                  username: true, 
                  server: { 
                    select: { 
                      serverName: true, 
                      ipAddress: true,
                      serverType: true,
                      provider: true
                    } 
                  } 
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
              customFieldValues: {
                include: {
                  fieldDefinition: true
                }
              }
            }
          },
          costs: { take: 1, orderBy: { createdAt: 'desc' } }
        },
      }),
      prisma.domain.count({ where }),
      prisma.customFieldDefinition.findMany({
        where: { entityType: 'website', isActive: true },
        orderBy: { displayOrder: 'asc' }
      })
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
      },
      200,
      { availableCustomFields }
    );
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

function buildEmptyFilter(field: string, isEmpty: boolean) {
  switch (field) {
    case 'domainName':
      return isEmpty
        ? { OR: [{ domainName: { equals: '' } }, { domainName: null }] }
        : { domainName: { not: '' } };
    case 'clientName':
      return isEmpty ? { client: null } : { client: { isNot: null } };
    case 'cloudflareAccount':
      return isEmpty ? { cloudflareAccount: null } : { cloudflareAccount: { isNot: null } };
    case 'websiteName':
      return isEmpty ? { website: null } : { website: { isNot: null } };
    case 'serverName':
      return isEmpty
        ? { website: { server: null } }
        : { website: { server: { isNot: null } } };
    case 'googleAnalytics':
      return isEmpty
        ? { website: { googleAnalyticsAccountId: null } }
        : { website: { googleAnalyticsAccountId: { not: null } } };
    case 'googleSearchConsole':
      return isEmpty
        ? { website: { googleSearchConsoleAccountId: null } }
        : { website: { googleSearchConsoleAccountId: { not: null } } };
    case 'googleAds':
      return isEmpty
        ? { website: { googleAdsAccountId: null } }
        : { website: { googleAdsAccountId: { not: null } } };
    case 'tagManager':
      return isEmpty
        ? { website: { googleTagManagerAccountId: null } }
        : { website: { googleTagManagerAccountId: { not: null } } };
    default:
      return {};
  }
}

function buildOperator(operator: string, value: any, isEnum = false) {
  switch (operator) {
    case 'equals': return { equals: value, ...(isEnum ? {} : { mode: 'insensitive' }) };
    case 'contains': return { contains: value, ...(isEnum ? {} : { mode: 'insensitive' }) };
    case 'startsWith': return { startsWith: value, ...(isEnum ? {} : { mode: 'insensitive' }) };
    case 'endsWith': return { endsWith: value, ...(isEnum ? {} : { mode: 'insensitive' }) };
    case 'in': return { in: Array.isArray(value) ? value : [value] };
    default: return { equals: value };
  }
}
