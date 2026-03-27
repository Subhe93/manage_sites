'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientsStats } from '@/components/clients/clients-stats';
import { ClientsFilters } from '@/components/clients/clients-filters';
import { ClientsTable } from '@/components/clients/clients-table';
import { PermissionGate } from '@/components/auth/permission-gate';

export default function ClientsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    status: undefined as string | undefined,
    country: undefined as string | undefined,
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
      status: undefined,
      country: undefined,
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <PermissionGate section="clients" level="view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-500 mt-1">Manage your clients and customers</p>
          </div>
          <PermissionGate section="clients" level="edit">
            <Button onClick={() => router.push('/clients/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </PermissionGate>
        </div>

        {/* Stats */}
        <ClientsStats />

        {/* Filters */}
        <ClientsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Table */}
        <ClientsTable
          filters={filters}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      </div>
    </PermissionGate>
  );
}
