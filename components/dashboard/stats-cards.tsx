'use client';

import { Globe, Server, Monitor, Users, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardStats } from '@/lib/mock-data';

const stats = [
  {
    label: 'Total Domains',
    value: dashboardStats.totalDomains,
    subValue: `${dashboardStats.activeDomains} active`,
    icon: Globe,
    trend: '+2',
    trendUp: true,
    color: 'text-[hsl(199,89%,38%)]',
    bgColor: 'bg-[hsl(199,89%,38%)]/10',
  },
  {
    label: 'Servers',
    value: dashboardStats.totalServers,
    subValue: `${dashboardStats.activeServers} active`,
    icon: Server,
    trend: '0',
    trendUp: true,
    color: 'text-[hsl(162,63%,41%)]',
    bgColor: 'bg-[hsl(162,63%,41%)]/10',
  },
  {
    label: 'Websites',
    value: dashboardStats.totalWebsites,
    subValue: `${dashboardStats.activeWebsites} active`,
    icon: Monitor,
    trend: '+3',
    trendUp: true,
    color: 'text-[hsl(215,20%,65%)]',
    bgColor: 'bg-[hsl(215,20%,65%)]/10',
  },
  {
    label: 'Clients',
    value: dashboardStats.totalClients,
    subValue: `${dashboardStats.activeClients} active`,
    icon: Users,
    trend: '+1',
    trendUp: true,
    color: 'text-[hsl(43,96%,46%)]',
    bgColor: 'bg-[hsl(43,96%,46%)]/10',
  },
  {
    label: 'Monthly Revenue',
    value: `$${dashboardStats.monthlyRevenue.toLocaleString()}`,
    subValue: 'This month',
    icon: TrendingUp,
    trend: '+8%',
    trendUp: true,
    color: 'text-[hsl(162,63%,41%)]',
    bgColor: 'bg-[hsl(162,63%,41%)]/10',
  },
  {
    label: 'Open Incidents',
    value: dashboardStats.openIncidents,
    subValue: 'Needs attention',
    icon: ShieldAlert,
    trend: '-1',
    trendUp: false,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trendUp ? 'text-[hsl(162,63%,41%)]' : 'text-destructive'
                }`}>
                  {stat.trend !== '0' && (
                    <>
                      {stat.trendUp ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.trend}
                    </>
                  )}
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
