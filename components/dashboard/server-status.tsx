'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Server, Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';
import type { ServerWithMonitoring } from '@/hooks/use-dashboard';

interface ServerStatusProps {
  servers: ServerWithMonitoring[];
  loading: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-[hsl(162,63%,41%)]',
  maintenance: 'bg-[hsl(43,96%,46%)]',
  suspended: 'bg-[hsl(215,20%,65%)]',
  terminated: 'bg-destructive',
};

const statusBadgeColors: Record<string, string> = {
  active: 'bg-[hsl(162,63%,41%)]/10 text-[hsl(162,63%,41%)] border-[hsl(162,63%,41%)]/20',
  maintenance: 'bg-[hsl(43,96%,46%)]/10 text-[hsl(43,76%,36%)] border-[hsl(43,96%,46%)]/20',
  suspended: 'bg-[hsl(215,20%,65%)]/10 text-[hsl(215,20%,45%)] border-[hsl(215,20%,65%)]/20',
  terminated: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function ServerStatus({ servers, loading }: ServerStatusProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Server Status
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {servers.length} servers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : servers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No servers found</p>
        ) : (
          servers.map((server) => {
            const monitoring = server.monitoring?.[0] || null;

            return (
              <div
                key={server.id}
                className="rounded-lg border p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${statusColors[server.status] || 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{server.serverName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {server.ipAddress || '-'} &middot; {server.location || '-'}
                        {server.provider ? ` &middot; ${server.provider.providerName}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusBadgeColors[server.status] || ''}`}>
                    {server.status}
                  </Badge>
                </div>

                {monitoring && server.status === 'active' && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Cpu className="h-3 w-3" /> CPU
                      </div>
                      <Progress value={monitoring.cpuUsage ?? 0} className="h-1.5" />
                      <p className="text-[10px] font-medium">{monitoring.cpuUsage ?? 0}%</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MemoryStick className="h-3 w-3" /> RAM
                      </div>
                      <Progress value={monitoring.ramUsage ?? 0} className="h-1.5" />
                      <p className="text-[10px] font-medium">{monitoring.ramUsage ?? 0}%</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <HardDrive className="h-3 w-3" /> Storage
                      </div>
                      <Progress value={monitoring.storageUsage ?? 0} className="h-1.5" />
                      <p className="text-[10px] font-medium">{monitoring.storageUsage ?? 0}%</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Wifi className="h-3 w-3" /> Uptime
                      </div>
                      <Progress value={monitoring.uptimePercentage ?? 0} className="h-1.5" />
                      <p className="text-[10px] font-medium">{monitoring.uptimePercentage ?? 0}%</p>
                    </div>
                  </div>
                )}

                {server.status === 'maintenance' && (
                  <p className="text-xs text-muted-foreground italic">Server is under maintenance</p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
