'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DomainsStats } from '@/components/domains/domains-stats';
import { DomainsFilters } from '@/components/domains/domains-filters';
import { DomainsTable } from '@/components/domains/domains-table';
import { DomainDetailPanel } from '@/components/domains/domain-detail-panel';

export default function DomainsPage() {
  const router = useRouter();
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    status: undefined as string | undefined,
    clientId: undefined as number | undefined,
    registrarId: undefined as number | undefined,
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
      clientId: undefined,
      registrarId: undefined,
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
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-gray-500 mt-1">Manage your domain portfolio</p>
        </div>
        <Button onClick={() => router.push('/domains/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Stats */}
      <DomainsStats />

      {/* Filters */}
      <DomainsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <DomainsTable
        filters={filters}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onViewDomain={(id) => setSelectedDomainId(id)}
      />

      {/* Detail Panel */}
      {selectedDomainId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedDomainId(null)}
          />
          <DomainDetailPanel
            domainId={selectedDomainId}
            onClose={() => setSelectedDomainId(null)}
          />
        </>
      )}
    </div>
  );
}
