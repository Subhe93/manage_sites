import { useState, useCallback, useEffect } from 'react';

export interface SavedFilter {
  id: number;
  userId: number;
  name: string;
  page: string;
  filters: any;
  columns: any;
  isDefault: boolean;
}

export function useSavedFilters(userId: number, pageName: string) {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFilters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/saved-filters?userId=${userId}&page=${pageName}`);
      const data = await res.json();
      if (data.success) {
        setFilters(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch saved filters', error);
    } finally {
      setLoading(false);
    }
  }, [userId, pageName]);

  useEffect(() => {
    if (userId) fetchFilters();
  }, [fetchFilters, userId]);

  const saveFilter = async (name: string, filtersState: any, columnsState: any, isDefault: boolean = false) => {
    try {
      const res = await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          page: pageName,
          name,
          filters: filtersState,
          columns: columnsState,
          isDefault,
        }),
      });
      if (res.ok) await fetchFilters();
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const updateFilter = async (id: number, updates: Partial<SavedFilter>) => {
    try {
      const res = await fetch(`/api/saved-filters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) await fetchFilters();
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFilter = async (id: number) => {
    try {
      const res = await fetch(`/api/saved-filters/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) await fetchFilters();
    } catch (error) {
      console.error(error);
    }
  };

  return { filters, loading, saveFilter, updateFilter, deleteFilter, refetch: fetchFilters };
}
