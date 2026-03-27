'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WebsitesStats } from '@/components/websites/websites-stats';
import { WebsitesFilters } from '@/components/websites/websites-filters';
import { WebsitesTable } from '@/components/websites/websites-table';
import { PermissionGate } from '@/components/auth/permission-gate';

export default function WebsitesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    type: undefined as string | undefined,
    status: undefined as string | undefined,
    environment: undefined as string | undefined,
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
      type: undefined,
      status: undefined,
      environment: undefined,
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <PermissionGate section="websites" level="view">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Websites</h1>
            <p className="text-gray-500 mt-1">
              Manage all hosted websites and applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/settings/custom-fields')}>
              Custom Fields
            </Button>
            <PermissionGate section="websites" level="edit">
              <Button onClick={() => router.push('/websites/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </PermissionGate>
          </div>
        </div>

        <WebsitesStats />

        <WebsitesFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        <WebsitesTable
          filters={filters}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      </div>
    </PermissionGate>
  );
}
