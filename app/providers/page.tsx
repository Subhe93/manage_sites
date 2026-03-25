'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProvidersStats } from '@/components/providers/providers-stats';
import { ProvidersFilters } from '@/components/providers/providers-filters';
import { ProvidersTable } from '@/components/providers/providers-table';

export default function ProvidersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    providerType: undefined as string | undefined,
    search: undefined as string | undefined,
    sortBy: 'createdAt' as string,
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      providerType: undefined,
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-gray-500 mt-1">
            Manage hosting, domain registrars, and other service providers
          </p>
        </div>
        <Button onClick={() => router.push('/providers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Stats */}
      <ProvidersStats />

      {/* Filters */}
      <ProvidersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <ProvidersTable
        filters={filters}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
