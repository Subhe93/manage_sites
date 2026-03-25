'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Client, ClientStatus } from '@/lib/types';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const ClientsStats = dynamic(() => import('@/components/clients/clients-stats').then(m => ({ default: m.ClientsStats })), { ssr: false });
const ClientsTable = dynamic(() => import('@/components/clients/clients-table').then(m => ({ default: m.ClientsTable })), { ssr: false });
const ClientDetailPanel = dynamic(() => import('@/components/clients/client-detail-panel').then(m => ({ default: m.ClientDetailPanel })), { ssr: false });

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

  return (
    <div className="min-h-screen">
      <Header title="Clients" description="Manage your client accounts" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <ClientsStats activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        <ClientsTable onViewClient={setSelectedClient} statusFilter={statusFilter} />
      </div>

      {selectedClient && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedClient(null)}
          />
          <ClientDetailPanel
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        </>
      )}
    </div>
  );
}
