'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PermissionsStats } from '@/components/permissions/permissions-stats';
import { PermissionsFilters } from '@/components/permissions/permissions-filters';
import { PermissionsTable } from '@/components/permissions/permissions-table';

export default function PermissionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    permissionLevel: undefined as string | undefined,
    entityType: undefined as string | undefined,
    search: undefined as string | undefined,
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

  const handleReset = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      permissionLevel: undefined,
      entityType: undefined,
      search: undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permissions</h1>
          <p className="text-gray-500 mt-1">Manage user permissions and access levels</p>
        </div>
        <Button onClick={() => router.push('/permissions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Permission
        </Button>
      </div>

      {/* Stats */}
      <PermissionsStats />

      {/* Filters */}
      <PermissionsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <PermissionsTable filters={filters} onPageChange={handlePageChange} />
    </div>
  );
}
