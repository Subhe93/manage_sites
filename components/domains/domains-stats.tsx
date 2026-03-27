'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDomainStats } from '@/hooks/use-domains';
import { Globe, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DomainsStats() {
  const { stats, loading } = useDomainStats();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
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
    active: { label: 'Active', icon: CheckCircle, color: 'text-green-600' },
    expired: { label: 'Expired', icon: XCircle, color: 'text-red-600' },
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    suspended: { label: 'Suspended', icon: AlertTriangle, color: 'text-orange-600' },
    deleted: { label: 'Deleted', icon: XCircle, color: 'text-gray-600' },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      {Object.entries(stats?.byStatus || {}).map(([status, count]: [string, any]) => {
        const config = statusConfig[status] || { label: status, icon: Globe, color: 'text-gray-600' };
        const Icon = config.icon;
        
        return (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count as number}</div>
            </CardContent>
          </Card>
        );
      })}

      {stats?.expiringSoon !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
