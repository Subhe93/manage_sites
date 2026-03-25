/**
 * API Client Helper
 * يسهل استدعاء الـ APIs من Client Components
 */

export class ApiClient {
  private static baseUrl = '/api';

  /**
   * دالة عامة للطلبات
   */
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<{ success: boolean; data?: T; error?: any; pagination?: any }> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string, params?: Record<string, any>) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  static async post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  static async put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

/**
 * Domains API Client
 */
export class DomainsApi {
  /**
   * جلب جميع النطاقات
   */
  static async getAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    clientId?: number;
  }) {
    return ApiClient.get('/domains', params);
  }

  /**
   * جلب نطاق معين
   */
  static async getById(id: number) {
    return ApiClient.get(`/domains/${id}`);
  }

  /**
   * إنشاء نطاق جديد
   */
  static async create(data: any) {
    return ApiClient.post('/domains', data);
  }

  /**
   * تحديث نطاق
   */
  static async update(id: number, data: any) {
    return ApiClient.put(`/domains/${id}`, data);
  }

  /**
   * حذف نطاق
   */
  static async delete(id: number) {
    return ApiClient.delete(`/domains/${id}`);
  }

  /**
   * جلب إحصائيات النطاقات
   */
  static async getStats() {
    return ApiClient.get('/domains/stats');
  }
}

/**
 * Websites API Client
 */
export class WebsitesApi {
  /**
   * جلب جميع المواقع
   */
  static async getAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    clientId?: number;
    type?: string;
    environment?: string;
    search?: string;
  }) {
    return ApiClient.get('/websites', params);
  }

  /**
   * جلب موقع معين
   */
  static async getById(id: number) {
    return ApiClient.get(`/websites/${id}`);
  }

  /**
   * إنشاء موقع جديد
   */
  static async create(data: any) {
    return ApiClient.post('/websites', data);
  }

  /**
   * تحديث موقع
   */
  static async update(id: number, data: any) {
    return ApiClient.put(`/websites/${id}`, data);
  }

  /**
   * حذف موقع
   */
  static async delete(id: number) {
    return ApiClient.delete(`/websites/${id}`);
  }
}

/**
 * Clients API Client
 */
export class ClientsApi {
  static async getAll(params?: { page?: number; pageSize?: number }) {
    return ApiClient.get('/clients', params);
  }

  static async getById(id: number) {
    return ApiClient.get(`/clients/${id}`);
  }

  static async create(data: any) {
    return ApiClient.post('/clients', data);
  }

  static async update(id: number, data: any) {
    return ApiClient.put(`/clients/${id}`, data);
  }

  static async delete(id: number) {
    return ApiClient.delete(`/clients/${id}`);
  }
}

/**
 * Servers API Client
 */
export class ServersApi {
  static async getAll(params?: { page?: number; pageSize?: number }) {
    return ApiClient.get('/servers', params);
  }

  static async getById(id: number) {
    return ApiClient.get(`/servers/${id}`);
  }

  static async create(data: any) {
    return ApiClient.post('/servers', data);
  }

  static async update(id: number, data: any) {
    return ApiClient.put(`/servers/${id}`, data);
  }

  static async delete(id: number) {
    return ApiClient.delete(`/servers/${id}`);
  }
}

/**
 * Users API Client
 */
export class UsersApi {
  static async getAll(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return ApiClient.get('/users', params);
  }

  static async getById(id: number) {
    return ApiClient.get(`/users/${id}`);
  }

  static async create(data: any) {
    return ApiClient.post('/users', data);
  }

  static async update(id: number, data: any) {
    return ApiClient.put(`/users/${id}`, data);
  }

  static async delete(id: number) {
    return ApiClient.delete(`/users/${id}`);
  }

  static async getStats() {
    return ApiClient.get('/users/stats');
  }
}

/**
 * Notifications API Client
 */
export class NotificationsApi {
  static async getAll(params?: { unreadOnly?: boolean }) {
    return ApiClient.get('/notifications', params);
  }

  static async markAsRead(id: number) {
    return ApiClient.put(`/notifications/${id}/read`, {});
  }

  static async markAllAsRead() {
    return ApiClient.put('/notifications/read-all', {});
  }

  static async getUnreadCount() {
    return ApiClient.get('/notifications/unread-count');
  }
}
