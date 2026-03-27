'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProviderStats } from '@/hooks/use-providers';
import { Server, Globe, Shield, Cloud, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProvidersStats() {
  const { stats, loading } = useProviderStats();

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

  const typeIcons: Record<string, any> = {
    registrar: Globe,
    hosting: Server,
    cdn: Cloud,
    ssl: Shield,
    other: Package,
  };

  const typeLabels: Record<string, string> = {
    registrar: 'Registrars',
    hosting: 'Hosting',
    cdn: 'CDN',
    ssl: 'SSL',
    other: 'Other',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      {Object.entries(stats?.byType || {}).map(([type, count]: [string, any]) => {
        const Icon = typeIcons[type] || Package;
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
