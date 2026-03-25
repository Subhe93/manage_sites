'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Website, WebsiteStatus } from '@/lib/types';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const WebsitesStats = dynamic(() => import('@/components/websites/websites-stats').then(m => ({ default: m.WebsitesStats })), { ssr: false });
const WebsitesTable = dynamic(() => import('@/components/websites/websites-table').then(m => ({ default: m.WebsitesTable })), { ssr: false });
const WebsiteDetailPanel = dynamic(() => import('@/components/websites/website-detail-panel').then(m => ({ default: m.WebsiteDetailPanel })), { ssr: false });

export default function WebsitesPage() {
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [statusFilter, setStatusFilter] = useState<WebsiteStatus | 'all'>('all');

  return (
    <div className="min-h-screen">
      <Header title="Websites" description="Manage all hosted websites and applications" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Website
          </Button>
        </div>

        <WebsitesStats activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        <WebsitesTable onViewWebsite={setSelectedWebsite} statusFilter={statusFilter} />
      </div>

      {selectedWebsite && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedWebsite(null)}
          />
          <WebsiteDetailPanel
            website={selectedWebsite}
            onClose={() => setSelectedWebsite(null)}
          />
        </>
      )}
    </div>
  );
}
