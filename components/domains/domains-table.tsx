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
import { Search, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, RefreshCw, Shield, ShieldOff } from 'lucide-react';
import { mockDomains, mockClients, mockProviders, mockDomainCosts } from '@/lib/mock-data';
import type { Domain, DomainStatus } from '@/lib/types';

const statusStyles: Record<DomainStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  deleted: 'bg-red-800/10 text-red-800 border-red-800/20',
};

function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryColor(days: number): string {
  if (days < 0) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-red-600';
  if (days <= 90) return 'text-amber-600';
  return 'text-emerald-600';
}

interface DomainsTableProps {
  onViewDomain: (domain: Domain) => void;
  statusFilter: DomainStatus | 'all';
}

export function DomainsTable({ onViewDomain, statusFilter }: DomainsTableProps) {
  const [search, setSearch] = useState('');
  const [registrarFilter, setRegistrarFilter] = useState<string>('all');

  const registrars = mockProviders.filter(p => p.provider_type === 'registrar');

  const filtered = mockDomains.filter((domain) => {
    const matchesSearch =
      domain.domain_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter;
    const matchesRegistrar = registrarFilter === 'all' || String(domain.registrar_id) === registrarFilter;
    return matchesSearch && matchesStatus && matchesRegistrar;
  });

  const sorted = [...filtered].sort((a, b) => {
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={registrarFilter} onValueChange={setRegistrarFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Registrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registrars</SelectItem>
            {registrars.map(r => (
              <SelectItem key={r.id} value={String(r.id)}>{r.provider_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-medium">Domain</TableHead>
              <TableHead className="text-xs font-medium">Client</TableHead>
              <TableHead className="text-xs font-medium">Registrar</TableHead>
              <TableHead className="text-xs font-medium">Status</TableHead>
              <TableHead className="text-xs font-medium">Expiry</TableHead>
              <TableHead className="text-xs font-medium text-center">Days Left</TableHead>
              <TableHead className="text-xs font-medium text-center">Auto-Renew</TableHead>
              <TableHead className="text-xs font-medium text-center">WHOIS</TableHead>
              <TableHead className="text-xs font-medium text-right">Cost</TableHead>
              <TableHead className="text-xs font-medium w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  No domains found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((domain) => {
                const client = mockClients.find(c => c.id === domain.client_id);
                const registrar = mockProviders.find(p => p.id === domain.registrar_id);
                const cost = mockDomainCosts.find(c => c.domain_id === domain.id);
                const daysLeft = getDaysUntilExpiry(domain.expiry_date);

                return (
                  <TableRow
                    key={domain.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onViewDomain(domain)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{domain.domain_name}</p>
                        <p className="text-[11px] text-muted-foreground">{domain.tld}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client?.client_name || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{registrar?.provider_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusStyles[domain.status]}`}>
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.expiry_date}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium ${getExpiryColor(daysLeft)}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {domain.auto_renew ? (
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {domain.whois_privacy ? (
                        <Shield className="h-3.5 w-3.5 text-primary mx-auto" />
                      ) : (
                        <ShieldOff className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {cost ? (
                        <span className="font-medium">
                          {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.cost_amount}
                          <span className="text-[10px] text-muted-foreground ml-0.5">/{cost.billing_cycle === 'yearly' ? 'yr' : cost.billing_cycle}</span>
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
                          <DropdownMenuItem onClick={() => onViewDomain(domain)}>
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
        <span>Showing {sorted.length} of {mockDomains.length} domains</span>
        <span>
          Total cost: ${mockDomainCosts.filter(c => c.currency === 'USD').reduce((sum, c) => sum + c.cost_amount, 0).toFixed(2)}/yr (USD)
        </span>
      </div>
    </div>
  );
}
