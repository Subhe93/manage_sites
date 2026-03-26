import { NextRequest } from 'next/server';
import { savedFilterRepository } from '@/lib/db/repositories';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { z } from 'zod';

const updateSavedFilterSchema = z.object({
  name: z.string().min(1).optional(),
  filters: z.any().optional(),
  columns: z.any().optional(),
  isDefault: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return ApiResponseHelper.error('Invalid ID', 400);

    const body = await request.json();
    const validatedData = updateSavedFilterSchema.parse(body);

    const existing = await savedFilterRepository.findById(id);
    if (!existing) return ApiResponseHelper.notFound('Filter not found');

    const filter = await savedFilterRepository.update(id, validatedData as any);

    if (validatedData.isDefault && !existing.isDefault) {
      await savedFilterRepository.setAsDefault(filter.id, filter.userId, filter.page);
    }

    return ApiResponseHelper.success(filter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponseHelper.validationError(error.errors);
    }
    return ApiErrorHandler.handle(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return ApiResponseHelper.error('Invalid ID', 400);

    const existing = await savedFilterRepository.findById(id);
    if (!existing) return ApiResponseHelper.notFound('Filter not found');

    await savedFilterRepository.delete(id);
    return ApiResponseHelper.success({ success: true });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
