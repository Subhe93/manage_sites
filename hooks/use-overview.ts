import { useState, useCallback, useEffect, useRef } from 'react';

export interface OverviewFilters {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  customFilters: any[];
  globalSearch?: string;
}

export function useOverview(filters: OverviewFilters) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCustomFields, setAvailableCustomFields] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // Debounce ref for search
  const debounceRef = useRef<NodeJS.Timeout>();
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchData = useCallback(async (currentFilters: OverviewFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentFilters.page),
        pageSize: String(currentFilters.pageSize),
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      });

      const res = await fetch(`/api/overview?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: currentFilters.customFilters,
          globalSearch: currentFilters.globalSearch || '',
        }),
      });
      const result = await res.json();
      
      if (result.success) {
        setData(result.data.items || result.data);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        } else if (result.meta?.pagination) {
          setPagination(result.meta.pagination);
        }
        if (result.meta?.availableCustomFields) {
          setAvailableCustomFields(result.meta.availableCustomFields);
        }
      }
    } catch (error) {
      console.error('Failed to fetch overview data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce only for globalSearch changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchData(filters);
    }, filters.globalSearch ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchData, filters]);

  return { data, loading, pagination, availableCustomFields, refetch: () => fetchData(filtersRef.current) };
}
