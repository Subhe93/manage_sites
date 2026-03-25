'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Domain, DomainStatus } from '@/lib/types';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const DomainsStats = dynamic(() => import('@/components/domains/domains-stats').then(m => ({ default: m.DomainsStats })), { ssr: false });
const DomainsTable = dynamic(() => import('@/components/domains/domains-table').then(m => ({ default: m.DomainsTable })), { ssr: false });
const DomainDetailPanel = dynamic(() => import('@/components/domains/domain-detail-panel').then(m => ({ default: m.DomainDetailPanel })), { ssr: false });

export default function DomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [statusFilter, setStatusFilter] = useState<DomainStatus | 'all'>('all');

  return (
    <div className="min-h-screen">
      <Header title="Domains" description="Manage your domain portfolio" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        </div>

        <DomainsStats activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        <DomainsTable onViewDomain={setSelectedDomain} statusFilter={statusFilter} />
      </div>

      {selectedDomain && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedDomain(null)}
          />
          <DomainDetailPanel
            domain={selectedDomain}
            onClose={() => setSelectedDomain(null)}
          />
        </>
      )}
    </div>
  );
}
