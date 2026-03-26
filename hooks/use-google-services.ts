import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type GoogleAccountStatus = 'active' | 'inactive' | 'suspended';

export interface GoogleAdsAccount {
  id: number;
  accountName: string;
  accountEmail: string;
  customerId: string | null;
  status: GoogleAccountStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAnalyticsAccount {
  id: number;
  accountName: string;
  accountEmail: string;
  accountId: string | null;
  propertyId: string | null;
  measurementId: string | null;
  analyticsVersion: 'ua' | 'ga4';
  status: GoogleAccountStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleSearchConsoleAccount {
  id: number;
  accountName: string;
  accountEmail: string;
  status: GoogleAccountStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleTagManagerAccount {
  id: number;
  accountName: string;
  accountEmail: string;
  accountId: string | null;
  status: GoogleAccountStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function useAccountList<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch data');
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, refetch };
}

function useAccountById<T>(endpoint: string, id: number) {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`${endpoint}/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch record');
      }

      setItem(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch record');
    } finally {
      setLoading(false);
    }
  }, [endpoint, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { item, loading, refetch };
}

function useAccountMutations<T>(endpoint: string, entityLabel: string) {
  const createItem = async (data: Partial<T>) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `Failed to create ${entityLabel}`);
    }

    toast.success(`${entityLabel} created successfully`);
    return result.data;
  };

  const updateItem = async (id: number, data: Partial<T>) => {
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `Failed to update ${entityLabel}`);
    }

    toast.success(`${entityLabel} updated successfully`);
    return result.data;
  };

  const deleteItem = async (id: number) => {
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error?.message || `Failed to delete ${entityLabel}`);
    }

    toast.success(`${entityLabel} deleted successfully`);
  };

  return { createItem, updateItem, deleteItem };
}

export function useGoogleAdsAccounts() {
  return useAccountList<GoogleAdsAccount>('/api/google/ads');
}

export function useGoogleAdsAccount(id: number) {
  return useAccountById<GoogleAdsAccount>('/api/google/ads', id);
}

export function useGoogleAdsMutations() {
  return useAccountMutations<GoogleAdsAccount>('/api/google/ads', 'Google Ads account');
}

export function useGoogleAnalyticsAccounts() {
  return useAccountList<GoogleAnalyticsAccount>('/api/google/analytics');
}

export function useGoogleAnalyticsAccount(id: number) {
  return useAccountById<GoogleAnalyticsAccount>('/api/google/analytics', id);
}

export function useGoogleAnalyticsMutations() {
  return useAccountMutations<GoogleAnalyticsAccount>('/api/google/analytics', 'Google Analytics account');
}

export function useGoogleSearchConsoleAccounts() {
  return useAccountList<GoogleSearchConsoleAccount>('/api/google/search-console');
}

export function useGoogleSearchConsoleAccount(id: number) {
  return useAccountById<GoogleSearchConsoleAccount>('/api/google/search-console', id);
}

export function useGoogleSearchConsoleMutations() {
  return useAccountMutations<GoogleSearchConsoleAccount>('/api/google/search-console', 'Google Search Console account');
}

export function useGoogleTagManagerAccounts() {
  return useAccountList<GoogleTagManagerAccount>('/api/google/tag-manager');
}

export function useGoogleTagManagerAccount(id: number) {
  return useAccountById<GoogleTagManagerAccount>('/api/google/tag-manager', id);
}

export function useGoogleTagManagerMutations() {
  return useAccountMutations<GoogleTagManagerAccount>('/api/google/tag-manager', 'Google Tag Manager account');
}
