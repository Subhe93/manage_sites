import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponseHelper } from '@/lib/api/response';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import { withRequestContext } from '@/lib/api/request-context';
import { EntityType } from '@prisma/client';

export async function GET(request: NextRequest) {
  return withRequestContext(request, async () => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const entityType = searchParams.get('entityType') as EntityType || 'website';
      const isActive = searchParams.get('isActive');

      const where: any = { entityType };
      if (isActive !== null) {
        where.isActive = isActive === 'true';
      }

      const fields = await prisma.customFieldDefinition.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
      });

      return ApiResponseHelper.success(fields);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRequestContext(request, async () => {
    try {
      const body = await request.json();
      
      if (!body.fieldName || !body.fieldLabel || !body.fieldType) {
        return ApiResponseHelper.validationError('Missing required fields');
      }

      const entityType = body.entityType || 'website';
      
      const existing = await prisma.customFieldDefinition.findUnique({
        where: {
          entityType_fieldName: {
            entityType,
            fieldName: body.fieldName
          }
        }
      });

      if (existing) {
        return ApiResponseHelper.validationError('Field name already exists for this entity type');
      }

      const maxOrderField = await prisma.customFieldDefinition.findFirst({
        where: { entityType },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      });
      
      const nextOrder = maxOrderField ? maxOrderField.displayOrder + 1 : 1;

      const newField = await prisma.customFieldDefinition.create({
        data: {
          entityType,
          fieldName: body.fieldName,
          fieldLabel: body.fieldLabel,
          fieldType: body.fieldType,
          fieldOptions: body.fieldOptions || null,
          isRequired: body.isRequired || false,
          defaultValue: body.defaultValue || null,
          displayOrder: body.displayOrder || nextOrder,
          isActive: body.isActive !== undefined ? body.isActive : true,
        }
      });

      return ApiResponseHelper.created(newField);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  });
}
