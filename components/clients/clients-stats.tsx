'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientStats } from '@/hooks/use-clients';
import { Users, UserCheck, UserX, UserMinus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ClientsStats() {
  const { stats, loading } = useClientStats();

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

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    active: { label: 'Active', icon: UserCheck, color: 'text-green-600' },
    suspended: { label: 'Suspended', icon: UserX, color: 'text-red-600' },
    inactive: { label: 'Inactive', icon: UserMinus, color: 'text-gray-600' },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      {Object.entries(stats?.byStatus || {}).map(([status, count]: [string, any]) => {
        const config = statusConfig[status] || { label: status, icon: Users, color: 'text-gray-600' };
        const Icon = config.icon;
        
        return (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <Icon className={`h-4 w-4 ${config.color}`} />
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
