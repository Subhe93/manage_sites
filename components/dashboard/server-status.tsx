'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockServers, mockServerMonitoring } from '@/lib/mock-data';
import { Server, Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';

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

function getProgressColor(value: number): string {
  if (value >= 80) return 'bg-destructive';
  if (value >= 60) return 'bg-[hsl(43,96%,46%)]';
  return 'bg-[hsl(162,63%,41%)]';
}

export function ServerStatus() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Server Status
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {mockServers.length} servers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockServers.map((server) => {
          const monitoring = mockServerMonitoring.find(m => m.server_id === server.id);

          return (
            <div
              key={server.id}
              className="rounded-lg border p-3.5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${statusColors[server.status]}`} />
                  <div>
                    <p className="text-sm font-medium">{server.server_name}</p>
                    <p className="text-[11px] text-muted-foreground">{server.ip_address} &middot; {server.location}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusBadgeColors[server.status]}`}>
                  {server.status}
                </Badge>
              </div>

              {monitoring && server.status === 'active' && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Cpu className="h-3 w-3" /> CPU
                    </div>
                    <Progress value={monitoring.cpu_usage} className="h-1.5" />
                    <p className="text-[10px] font-medium">{monitoring.cpu_usage}%</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MemoryStick className="h-3 w-3" /> RAM
                    </div>
                    <Progress value={monitoring.ram_usage} className="h-1.5" />
                    <p className="text-[10px] font-medium">{monitoring.ram_usage}%</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <HardDrive className="h-3 w-3" /> Storage
                    </div>
                    <Progress value={monitoring.storage_usage} className="h-1.5" />
                    <p className="text-[10px] font-medium">{monitoring.storage_usage}%</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Wifi className="h-3 w-3" /> Uptime
                    </div>
                    <Progress value={monitoring.uptime_percentage} className="h-1.5" />
                    <p className="text-[10px] font-medium">{monitoring.uptime_percentage}%</p>
                  </div>
                </div>
              )}

              {server.status === 'maintenance' && (
                <p className="text-xs text-muted-foreground italic">Server is under maintenance</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
