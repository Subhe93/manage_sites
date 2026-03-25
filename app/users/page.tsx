'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UsersStats } from '@/components/users/users-stats';
import { UsersFilters } from '@/components/users/users-filters';
import { UsersTable } from '@/components/users/users-table';

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    role: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
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
      role: undefined,
      isActive: undefined,
      search: undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users</p>
        </div>
        <Button onClick={() => router.push('/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <UsersStats />

      {/* Filters */}
      <UsersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <UsersTable filters={filters} onPageChange={handlePageChange} />
    </div>
  );
}
