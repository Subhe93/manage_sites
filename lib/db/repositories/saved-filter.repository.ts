import { SavedFilter, Prisma } from '@prisma/client';
import { BaseRepository } from '../base-repository';
import prisma from '@/lib/prisma';

export class SavedFilterRepository extends BaseRepository<
  SavedFilter,
  Prisma.SavedFilterCreateInput,
  Prisma.SavedFilterUpdateInput,
  Prisma.SavedFilterWhereInput
> {
  protected model = prisma.savedFilter;

  async findByUserIdAndPage(userId: number, page: string) {
    return this.findMany({
      where: {
        userId,
        page,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async setAsDefault(id: number, userId: number, page: string) {
    // Transaction to remove default from all others and set on this one
    return prisma.$transaction([
      prisma.savedFilter.updateMany({
        where: {
          userId,
          page,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.savedFilter.update({
        where: { id },
        data: {
          isDefault: true,
        },
      }),
    ]);
  }
}

export const savedFilterRepository = new SavedFilterRepository();
