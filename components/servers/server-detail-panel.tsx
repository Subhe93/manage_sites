'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  X,
  Server as ServerIcon,
  MapPin,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Clock,
  Gauge,
  DollarSign,
  CreditCard,
  Users,
  Database,
  Mail,
  Globe,
  Monitor,
} from 'lucide-react';
import {
  mockProviders,
  mockServerMonitoring,
  mockServerCosts,
  mockServerAccounts,
  mockClients,
  mockWebsites,
} from '@/lib/mock-data';
import type { Server, ServerStatus } from '@/lib/types';

const statusStyles: Record<ServerStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  terminated: 'bg-red-500/10 text-red-600 border-red-500/20',
};

function getUsageColor(value: number): string {
  if (value >= 90) return 'text-red-600';
  if (value >= 70) return 'text-amber-600';
  return 'text-emerald-600';
}

function getProgressColor(value: number): string {
  if (value >= 90) return '[&>div]:bg-red-500';
  if (value >= 70) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-emerald-500';
}

interface ServerDetailPanelProps {
  server: Server;
  onClose: () => void;
}

export function ServerDetailPanel({ server, onClose }: ServerDetailPanelProps) {
  const provider = mockProviders.find((p) => p.id === server.provider_id);
  const monitoring = mockServerMonitoring.find((m) => m.server_id === server.id);
  const cost = mockServerCosts.find((c) => c.server_id === server.id);
  const accounts = mockServerAccounts.filter((a) => a.server_id === server.id);
  const websites = mockWebsites.filter((w) =>
    accounts.some((a) => a.id === w.server_account_id)
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ServerIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{server.server_name}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {server.location}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`capitalize ${statusStyles[server.status]}`}>
            {server.status}
          </Badge>
          <Badge variant="secondary" className="text-[11px] capitalize">{server.server_type}</Badge>
          <Badge variant="secondary" className="text-[11px]">{server.operating_system}</Badge>
          {server.control_panel !== 'none' && (
            <Badge variant="secondary" className="text-[11px] capitalize">{server.control_panel}</Badge>
          )}
        </div>

        {monitoring && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Resource Monitoring
                </CardTitle>
                {monitoring.uptime_percentage > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {monitoring.uptime_percentage}% uptime
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Cpu className="h-3.5 w-3.5" /> CPU
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(monitoring.cpu_usage)}`}>
                      {monitoring.cpu_usage}%
                    </span>
                  </div>
                  <Progress value={monitoring.cpu_usage} className={`h-2 ${getProgressColor(monitoring.cpu_usage)}`} />
                  <p className="text-[10px] text-muted-foreground">{server.cpu_cores} cores</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MemoryStick className="h-3.5 w-3.5" /> RAM
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(monitoring.ram_usage)}`}>
                      {monitoring.ram_usage}%
                    </span>
                  </div>
                  <Progress value={monitoring.ram_usage} className={`h-2 ${getProgressColor(monitoring.ram_usage)}`} />
                  <p className="text-[10px] text-muted-foreground">{server.ram_gb} GB total</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <HardDrive className="h-3.5 w-3.5" /> Storage
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(monitoring.storage_usage)}`}>
                      {monitoring.storage_usage}%
                    </span>
                  </div>
                  <Progress value={monitoring.storage_usage} className={`h-2 ${getProgressColor(monitoring.storage_usage)}`} />
                  <p className="text-[10px] text-muted-foreground">{server.storage_gb} GB total</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Wifi className="h-3.5 w-3.5" /> Bandwidth
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {(monitoring.bandwidth_usage / 1000).toFixed(1)} TB
                    </span>
                  </div>
                  <Progress
                    value={(monitoring.bandwidth_usage / server.bandwidth_gb) * 100}
                    className={`h-2 ${getProgressColor((monitoring.bandwidth_usage / server.bandwidth_gb) * 100)}`}
                  />
                  <p className="text-[10px] text-muted-foreground">{server.bandwidth_gb} GB limit</p>
                </div>
              </div>

              {monitoring.response_time_ms > 0 && (
                <div className="flex items-center justify-between rounded-md border p-2.5 bg-muted/20">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Response Time
                  </div>
                  <span className="text-sm font-semibold">{monitoring.response_time_ms}ms</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-primary" />
              Server Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Provider</p>
                <p className="font-medium">{provider?.provider_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IP Address</p>
                <p className="font-mono text-xs font-medium">{server.ip_address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">OS</p>
                <p className="font-medium">{server.operating_system}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Control Panel</p>
                <p className="font-medium capitalize">{server.control_panel === 'none' ? 'None' : server.control_panel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Configuration</p>
                <p className="text-xs font-medium">{server.cpu_cores} CPU / {server.ram_gb}GB RAM / {server.storage_gb}GB SSD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{server.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {cost && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Cost Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Cost</p>
                  <p className="text-lg font-bold text-primary">
                    {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.cost_amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium capitalize">{cost.billing_cycle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {cost.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Billing</p>
                  <p className="font-medium">{cost.next_billing_date}</p>
                </div>
                {cost.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{cost.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {accounts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Hosting Accounts ({accounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[11px] font-medium">User</TableHead>
                      <TableHead className="text-[11px] font-medium">Client</TableHead>
                      <TableHead className="text-[11px] font-medium">Disk</TableHead>
                      <TableHead className="text-[11px] font-medium text-center">
                        <Database className="h-3 w-3 mx-auto" />
                      </TableHead>
                      <TableHead className="text-[11px] font-medium text-center">
                        <Mail className="h-3 w-3 mx-auto" />
                      </TableHead>
                      <TableHead className="text-[11px] font-medium text-center">
                        <Globe className="h-3 w-3 mx-auto" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => {
                      const client = mockClients.find(c => c.id === account.client_id);
                      const diskPercent = Math.round((account.disk_usage_mb / account.disk_limit_mb) * 100);

                      return (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div>
                              <p className="text-xs font-medium font-mono">{account.username}</p>
                              <Badge
                                variant="outline"
                                className={`text-[9px] capitalize mt-0.5 ${
                                  account.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                  'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}
                              >
                                {account.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {client?.client_name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="w-16 space-y-0.5">
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${diskPercent >= 90 ? 'bg-red-500' : diskPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${diskPercent}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-muted-foreground">{(account.disk_usage_mb / 1000).toFixed(1)}GB / {(account.disk_limit_mb / 1000).toFixed(0)}GB</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs">{account.databases}</TableCell>
                          <TableCell className="text-center text-xs">{account.email_accounts}</TableCell>
                          <TableCell className="text-center text-xs">{account.addon_domains}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {websites.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                Hosted Websites ({websites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{website.website_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">{website.website_type}</Badge>
                        <span className="text-[10px] text-muted-foreground">{website.framework}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        website.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        website.status === 'maintenance' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}
                    >
                      {website.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
