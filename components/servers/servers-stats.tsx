'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServerStats } from '@/hooks/use-servers';
import { Server, HardDrive, Cloud, Database, Activity, AlertCircle, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ServersStats() {
  const { stats, loading } = useServerStats();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const typeIcons: Record<string, any> = {
    shared: HardDrive,
    vps: Server,
    dedicated: Database,
    cloud: Cloud,
  };

  const typeLabels: Record<string, string> = {
    shared: 'Shared',
    vps: 'VPS',
    dedicated: 'Dedicated',
    cloud: 'Cloud',
  };

  const statusIcons: Record<string, any> = {
    active: Activity,
    maintenance: Wrench,
    suspended: AlertCircle,
    terminated: AlertCircle,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      {Object.entries(stats?.byType || {}).map(([type, count]: [string, any]) => {
        const Icon = typeIcons[type] || Server;
        return (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {typeLabels[type] || type}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
