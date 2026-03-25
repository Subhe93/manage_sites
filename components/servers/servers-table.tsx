'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, MapPin } from 'lucide-react';
import { mockServers, mockProviders, mockServerMonitoring, mockServerCosts, mockServerAccounts } from '@/lib/mock-data';
import type { Server, ServerStatus } from '@/lib/types';

const statusStyles: Record<ServerStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  terminated: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const typeStyles: Record<string, string> = {
  dedicated: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  vps: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  cloud: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  shared: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

function getUsageColor(value: number): string {
  if (value >= 90) return 'bg-red-500';
  if (value >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

interface ServersTableProps {
  onViewServer: (server: Server) => void;
  statusFilter: ServerStatus | 'all';
}

export function ServersTable({ onViewServer, statusFilter }: ServersTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = mockServers.filter((server) => {
    const matchesSearch =
      server.server_name.toLowerCase().includes(search.toLowerCase()) ||
      server.ip_address.includes(search);
    const matchesStatus = statusFilter === 'all' || server.status === statusFilter;
    const matchesType = typeFilter === 'all' || server.server_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search servers or IPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Server Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="dedicated">Dedicated</SelectItem>
            <SelectItem value="vps">VPS</SelectItem>
            <SelectItem value="cloud">Cloud</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-medium">Server</TableHead>
              <TableHead className="text-xs font-medium">Type</TableHead>
              <TableHead className="text-xs font-medium">Provider</TableHead>
              <TableHead className="text-xs font-medium">Status</TableHead>
              <TableHead className="text-xs font-medium">CPU</TableHead>
              <TableHead className="text-xs font-medium">RAM</TableHead>
              <TableHead className="text-xs font-medium">Storage</TableHead>
              <TableHead className="text-xs font-medium text-center">Accounts</TableHead>
              <TableHead className="text-xs font-medium text-right">Cost/mo</TableHead>
              <TableHead className="text-xs font-medium w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  No servers found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((server) => {
                const provider = mockProviders.find(p => p.id === server.provider_id);
                const monitoring = mockServerMonitoring.find(m => m.server_id === server.id);
                const cost = mockServerCosts.find(c => c.server_id === server.id);
                const accounts = mockServerAccounts.filter(a => a.server_id === server.id);

                return (
                  <TableRow
                    key={server.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onViewServer(server)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{server.server_name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {server.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${typeStyles[server.server_type]}`}>
                        {server.server_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {provider?.provider_name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusStyles[server.status]}`}>
                        {server.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {monitoring && monitoring.cpu_usage > 0 ? (
                        <div className="w-20 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{monitoring.cpu_usage}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getUsageColor(monitoring.cpu_usage)}`}
                              style={{ width: `${monitoring.cpu_usage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {monitoring && monitoring.ram_usage > 0 ? (
                        <div className="w-20 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{monitoring.ram_usage}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getUsageColor(monitoring.ram_usage)}`}
                              style={{ width: `${monitoring.ram_usage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {monitoring ? (
                        <div className="w-20 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{monitoring.storage_usage}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getUsageColor(monitoring.storage_usage)}`}
                              style={{ width: `${monitoring.storage_usage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{accounts.length}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {cost ? (
                        <span className="font-medium">
                          {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.cost_amount}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewServer(server)}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Showing {filtered.length} of {mockServers.length} servers</span>
        <span>
          Total monthly: {mockServerCosts.reduce((sum, c) => {
            const rate = c.currency === 'EUR' ? 1.08 : 1;
            return sum + c.cost_amount * rate;
          }, 0).toFixed(2)} USD
        </span>
      </div>
    </div>
  );
}
