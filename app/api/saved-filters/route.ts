import { NextRequest } from 'next/server';
import { savedFilterRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

const createSavedFilterSchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1),
  page: z.string().min(1),
  filters: z.any(),
  columns: z.any().optional(),
  isDefault: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = searchParams.get('page');

    if (!userId || !page) {
      return ApiResponseHelper.error('userId and page are required', 400);
    }

    const filters = await savedFilterRepository.findByUserIdAndPage(parseInt(userId), page);
    return ApiResponseHelper.success(filters);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSavedFilterSchema.parse(body);

    const filter = await savedFilterRepository.create(validatedData as any);

    if (validatedData.isDefault) {
      await savedFilterRepository.setAsDefault(filter.id, filter.userId, filter.page);
    }

    return ApiResponseHelper.created(filter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponseHelper.validationError(error.errors);
    }
    return ApiErrorHandler.handle(error);
  }
}
