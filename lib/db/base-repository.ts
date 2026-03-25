import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Base Repository Pattern
 * يوفر عمليات CRUD أساسية لجميع الكيانات
 */
export abstract class BaseRepository<T, TCreateInput, TUpdateInput, TWhereInput> {
  protected abstract model: any;

  /**
   * جلب جميع السجلات مع إمكانية التصفية والترتيب والصفحات
   */
  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: TWhereInput;
    orderBy?: any;
    include?: any;
  }): Promise<T[]> {
    return this.model.findMany(params);
  }

  /**
   * جلب سجل واحد بناءً على المعرف
   */
  async findById(id: number, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * جلب سجل واحد بناءً على شرط
   */
  async findOne(where: TWhereInput, include?: any): Promise<T | null> {
    return this.model.findFirst({
      where,
      include,
    });
  }

  /**
   * إنشاء سجل جديد
   */
  async create(data: TCreateInput): Promise<T> {
    return this.model.create({
      data,
    });
  }

  /**
   * تحديث سجل موجود
   */
  async update(id: number, data: TUpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * حذف سجل
   */
  async delete(id: number): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * عد السجلات
   */
  async count(where?: TWhereInput): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * التحقق من وجود سجل
   */
  async exists(where: TWhereInput): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * جلب مع pagination
   */
  async paginate(params: {
    page: number;
    pageSize: number;
    where?: TWhereInput;
    orderBy?: any;
    include?: any;
  }) {
    const { page, pageSize, where, orderBy, include } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.model.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
  }
}
