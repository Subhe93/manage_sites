import { NextResponse } from 'next/server';

/**
 * API Response Helper
 * يوفر استجابات موحدة لجميع الـ APIs
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiResponseHelper {
  /**
   * استجابة ناجحة
   */
  static success<T>(data: T, status: number = 200, meta?: any): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(meta && { meta }),
      },
      { status }
    );
  }

  /**
   * استجابة ناجحة مع pagination
   */
  static successWithPagination<T>(
    data: T,
    pagination: ApiResponse['pagination'],
    status: number = 200,
    meta?: any
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        pagination,
        ...(meta && { meta }),
      },
      { status }
    );
  }

  /**
   * استجابة خطأ
   */
  static error(
    message: string,
    status: number = 400,
    code?: string,
    details?: any
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
          details,
        },
      },
      { status }
    );
  }

  /**
   * خطأ في التحقق من البيانات
   */
  static validationError(details: any): NextResponse<ApiResponse> {
    return this.error('Validation failed', 422, 'VALIDATION_ERROR', details);
  }

  /**
   * خطأ غير مصرح به
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  /**
   * خطأ ممنوع
   */
  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403, 'FORBIDDEN');
  }

  /**
   * خطأ غير موجود
   */
  static notFound(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return this.error(message, 404, 'NOT_FOUND');
  }

  /**
   * خطأ في الخادم
   */
  static serverError(
    message: string = 'Internal server error',
    details?: any
  ): NextResponse<ApiResponse> {
    return this.error(message, 500, 'SERVER_ERROR', details);
  }

  /**
   * تم الإنشاء بنجاح
   */
  static created<T>(data: T): NextResponse<ApiResponse<T>> {
    return this.success(data, 201);
  }

  /**
   * لا يوجد محتوى
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }
}
