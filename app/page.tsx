'use client';

import dynamic from 'next/dynamic';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const StatsCards = dynamic(() => import('@/components/dashboard/stats-cards').then(m => ({ default: m.StatsCards })), { ssr: false });
const DomainExpiryTable = dynamic(() => import('@/components/dashboard/domain-expiry-table').then(m => ({ default: m.DomainExpiryTable })), { ssr: false });
const ServerStatus = dynamic(() => import('@/components/dashboard/server-status').then(m => ({ default: m.ServerStatus })), { ssr: false });
const RecentActivity = dynamic(() => import('@/components/dashboard/recent-activity').then(m => ({ default: m.RecentActivity })), { ssr: false });
const AlertsPanel = dynamic(() => import('@/components/dashboard/alerts-panel').then(m => ({ default: m.AlertsPanel })), { ssr: false });
const QuickOverview = dynamic(() => import('@/components/dashboard/quick-overview').then(m => ({ default: m.QuickOverview })), { ssr: false });
const UpcomingPayments = dynamic(() => import('@/components/dashboard/upcoming-payments').then(m => ({ default: m.UpcomingPayments })), { ssr: false });

export default function DashboardPage() {
  const { data, loading } = useDashboard();

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" description="Overview of your infrastructure" />
      <div className="p-6 space-y-6">
        <StatsCards stats={data?.stats || null} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <DomainExpiryTable domains={data?.domainExpiryList || []} loading={loading} />
          </div>
          <div>
            <AlertsPanel alerts={data?.alerts || []} loading={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ServerStatus servers={data?.servers || []} loading={loading} />
          <QuickOverview websites={data?.websitesOverview || []} loading={loading} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <UpcomingPayments payments={data?.upcomingPayments || []} loading={loading} />
          <RecentActivity activities={data?.recentActivity || []} loading={loading} />
        </div>
      </div>
    </div>
  );
}
