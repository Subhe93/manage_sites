import { NextRequest } from 'next/server';
import { serverRepository } from '@/lib/db/repositories/server.repository';
import { ApiResponseHelper } from '@/lib/api/response';
import { asyncHandler } from '@/lib/api/error-handler';
import { z } from 'zod';
import { ServerType, ServerStatus, ControlPanel } from '@prisma/client';

/**
 * GET /api/servers
 * جلب جميع الخوادم مع pagination وفلاتر
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const serverType = searchParams.get('serverType');
  const status = searchParams.get('status');
  const providerId = searchParams.get('providerId');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const filters: any = {};

  if (serverType && serverType !== 'all' && serverType !== 'undefined') {
    filters.serverType = serverType as ServerType;
  }

  if (status && status !== 'all' && status !== 'undefined') {
    filters.status = status as ServerStatus;
  }

  if (providerId && providerId !== 'undefined') {
    filters.providerId = parseInt(providerId);
  }

  if (search && search.trim() !== '' && search !== 'undefined') {
    filters.search = search;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [servers, total] = await Promise.all([
    serverRepository.findAllWithFilters(filters, page, pageSize, orderBy),
    serverRepository.countWithFilters(filters),
  ]);

  return ApiResponseHelper.successWithPagination(
    servers,
    {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrev: page > 1,
    }
  );
});

/**
 * POST /api/servers
 * إنشاء خادم جديد
 */
const createServerSchema = z.object({
  serverName: z.string().min(1, 'Server name is required'),
  providerId: z.number().int().positive().optional().nullable(),
  serverType: z.nativeEnum(ServerType),
  ipAddress: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  operatingSystem: z.string().optional().nullable(),
  controlPanel: z.nativeEnum(ControlPanel).optional().nullable(),
  controlPanelUrl: z.string().url().optional().nullable(),
  cpuCores: z.number().int().positive().optional().nullable(),
  ramGb: z.number().int().positive().optional().nullable(),
  storageGb: z.number().int().positive().optional().nullable(),
  bandwidthGb: z.number().int().positive().optional().nullable(),
  status: z.nativeEnum(ServerStatus),
  notes: z.string().optional().nullable(),
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = createServerSchema.parse(body);

  const serverData: any = {
    serverName: validatedData.serverName,
    serverType: validatedData.serverType,
    ipAddress: validatedData.ipAddress,
    location: validatedData.location,
    operatingSystem: validatedData.operatingSystem,
    controlPanel: validatedData.controlPanel,
    controlPanelUrl: validatedData.controlPanelUrl,
    cpuCores: validatedData.cpuCores,
    ramGb: validatedData.ramGb,
    storageGb: validatedData.storageGb,
    bandwidthGb: validatedData.bandwidthGb,
    status: validatedData.status,
    notes: validatedData.notes,
  };

  if (validatedData.providerId) {
    serverData.provider = {
      connect: { id: validatedData.providerId },
    };
  }

  const server = await serverRepository.create(serverData);

  return ApiResponseHelper.created(server);
});
