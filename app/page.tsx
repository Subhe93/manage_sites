'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const StatsCards = dynamic(() => import('@/components/dashboard/stats-cards').then(m => ({ default: m.StatsCards })), { ssr: false });
const DomainExpiryTable = dynamic(() => import('@/components/dashboard/domain-expiry-table').then(m => ({ default: m.DomainExpiryTable })), { ssr: false });
const ServerStatus = dynamic(() => import('@/components/dashboard/server-status').then(m => ({ default: m.ServerStatus })), { ssr: false });
const RecentActivity = dynamic(() => import('@/components/dashboard/recent-activity').then(m => ({ default: m.RecentActivity })), { ssr: false });
const AlertsPanel = dynamic(() => import('@/components/dashboard/alerts-panel').then(m => ({ default: m.AlertsPanel })), { ssr: false });
const QuickOverview = dynamic(() => import('@/components/dashboard/quick-overview').then(m => ({ default: m.QuickOverview })), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header title="Dashboard" description="Overview of your infrastructure" />
      <div className="p-6 space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <DomainExpiryTable />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ServerStatus />
          <QuickOverview />
        </div>

        <RecentActivity />
      </div>
    </div>
  );
}
