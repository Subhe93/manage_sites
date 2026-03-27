'use client';

import { Globe, Server, Monitor, Users, TrendingUp, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/hooks/use-dashboard';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Domains',
      value: stats?.totalDomains ?? 0,
      subValue: `${stats?.activeDomains ?? 0} active · ${stats?.expiringDomains ?? 0} expiring`,
      icon: Globe,
      color: 'text-[hsl(199,89%,38%)]',
      bgColor: 'bg-[hsl(199,89%,38%)]/10',
    },
    {
      label: 'Servers',
      value: stats?.totalServers ?? 0,
      subValue: `${stats?.activeServers ?? 0} active`,
      icon: Server,
      color: 'text-[hsl(162,63%,41%)]',
      bgColor: 'bg-[hsl(162,63%,41%)]/10',
    },
    {
      label: 'Websites',
      value: stats?.totalWebsites ?? 0,
      subValue: `${stats?.activeWebsites ?? 0} active`,
      icon: Monitor,
      color: 'text-[hsl(215,20%,65%)]',
      bgColor: 'bg-[hsl(215,20%,65%)]/10',
    },
    {
      label: 'Clients',
      value: stats?.totalClients ?? 0,
      subValue: `${stats?.activeClients ?? 0} active`,
      icon: Users,
      color: 'text-[hsl(43,96%,46%)]',
      bgColor: 'bg-[hsl(43,96%,46%)]/10',
    },
    {
      label: 'Monthly Cost',
      value: `$${(stats?.totalMonthlyCost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subValue: 'All services combined',
      icon: TrendingUp,
      color: 'text-[hsl(162,63%,41%)]',
      bgColor: 'bg-[hsl(162,63%,41%)]/10',
    },
    {
      label: 'Avg Uptime',
      value: stats?.avgUptime ? `${stats.avgUptime}%` : '-',
      subValue: stats?.openIncidents ? `${stats.openIncidents} open incident${stats.openIncidents > 1 ? 's' : ''}` : 'No incidents',
      icon: stats?.openIncidents ? ShieldAlert : Activity,
      color: stats?.openIncidents ? 'text-destructive' : 'text-[hsl(162,63%,41%)]',
      bgColor: stats?.openIncidents ? 'bg-destructive/10' : 'bg-[hsl(162,63%,41%)]/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-7 w-16 mt-3" />
              <Skeleton className="h-3 w-24 mt-1.5" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
