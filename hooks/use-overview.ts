import { useState, useCallback, useEffect } from 'react';

export interface OverviewFilters {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  customFilters: any[];
}

export function useOverview(initialFilters: OverviewFilters) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async (currentFilters: OverviewFilters) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/overview?page=${currentFilters.page}&pageSize=${currentFilters.pageSize}&sortBy=${currentFilters.sortBy}&sortOrder=${currentFilters.sortOrder}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: currentFilters.customFilters }),
      });
      const result = await res.json();
      
      if (result.success) {
        setData(result.data.items || result.data);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        } else if (result.meta?.pagination) {
          setPagination(result.meta.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch overview data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(initialFilters);
  }, [fetchData, initialFilters]);

  return { data, loading, pagination, refetch: () => fetchData(initialFilters) };
}
