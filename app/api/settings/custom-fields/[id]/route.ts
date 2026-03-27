import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { withRequestContext } from '@/lib/api/request-context';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return ApiResponseHelper.validationError('Invalid ID');
      }

      const field = await prisma.customFieldDefinition.findUnique({
        where: { id },
      });

      if (!field) {
        return ApiResponseHelper.notFound('Custom field not found');
      }

      return ApiResponseHelper.success(field);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return ApiResponseHelper.validationError('Invalid ID');
      }

      const body = await request.json();

      const existing = await prisma.customFieldDefinition.findUnique({
        where: { id },
      });

      if (!existing) {
        return ApiResponseHelper.notFound('Custom field not found');
      }

      if (body.fieldName && body.fieldName !== existing.fieldName) {
        const conflict = await prisma.customFieldDefinition.findUnique({
          where: {
            entityType_fieldName: {
              entityType: existing.entityType,
              fieldName: body.fieldName
            }
          }
        });
        if (conflict) {
          return ApiResponseHelper.validationError('Field name already exists for this entity type');
        }
      }

      const updatedField = await prisma.customFieldDefinition.update({
        where: { id },
        data: {
          fieldName: body.fieldName !== undefined ? body.fieldName : undefined,
          fieldLabel: body.fieldLabel !== undefined ? body.fieldLabel : undefined,
          fieldType: body.fieldType !== undefined ? body.fieldType : undefined,
          fieldOptions: body.fieldOptions !== undefined ? body.fieldOptions : undefined,
          isRequired: body.isRequired !== undefined ? body.isRequired : undefined,
          defaultValue: body.defaultValue !== undefined ? body.defaultValue : undefined,
          displayOrder: body.displayOrder !== undefined ? body.displayOrder : undefined,
          isActive: body.isActive !== undefined ? body.isActive : undefined,
        }
      });

      return ApiResponseHelper.success(updatedField);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRequestContext(request, async () => {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return ApiResponseHelper.validationError('Invalid ID');
      }

      await prisma.customFieldDefinition.delete({
        where: { id },
      });

      return ApiResponseHelper.success({ message: 'Custom field deleted successfully' });
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}
