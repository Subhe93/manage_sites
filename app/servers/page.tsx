'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Server, ServerStatus } from '@/lib/types';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const ServersStats = dynamic(() => import('@/components/servers/servers-stats').then(m => ({ default: m.ServersStats })), { ssr: false });
const ServersTable = dynamic(() => import('@/components/servers/servers-table').then(m => ({ default: m.ServersTable })), { ssr: false });
const ServerDetailPanel = dynamic(() => import('@/components/servers/server-detail-panel').then(m => ({ default: m.ServerDetailPanel })), { ssr: false });

export default function ServersPage() {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServerStatus | 'all'>('all');

  return (
    <div className="min-h-screen">
      <Header title="Servers" description="Monitor and manage your server infrastructure" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Server
          </Button>
        </div>

        <ServersStats activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        <ServersTable onViewServer={setSelectedServer} statusFilter={statusFilter} />
      </div>

      {selectedServer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedServer(null)}
          />
          <ServerDetailPanel
            server={selectedServer}
            onClose={() => setSelectedServer(null)}
          />
        </>
      )}
    </div>
  );
}
