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
import { Search, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, ExternalLink, Lock, LockOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { mockWebsites, mockDomains, mockClients, mockServers, mockServerAccounts, mockSSLCertificates } from '@/lib/mock-data';
import type { Website, WebsiteStatus } from '@/lib/types';

const statusStyles: Record<WebsiteStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-600 border-red-500/20',
  archived: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

const typeStyles: Record<string, string> = {
  wordpress: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  spa: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  custom: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  mobile_app: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  static: 'bg-stone-400/10 text-stone-500 border-stone-400/20',
  ecommerce: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const envStyles: Record<string, string> = {
  production: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  staging: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  development: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
};

function getSSLStatus(websiteId: number): { label: string; ok: boolean } {
  const cert = mockSSLCertificates.find((c) => c.website_id === websiteId);
  if (!cert) return { label: 'None', ok: false };
  if (cert.status === 'expired') return { label: 'Expired', ok: false };
  const daysLeft = Math.ceil(
    (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 14) return { label: `${daysLeft}d`, ok: false };
  return { label: 'Valid', ok: true };
}

interface WebsitesTableProps {
  onViewWebsite: (website: Website) => void;
  statusFilter: WebsiteStatus | 'all';
}

export function WebsitesTable({ onViewWebsite, statusFilter }: WebsitesTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<string>('all');

  const filtered = mockWebsites.filter((website) => {
    const matchesSearch =
      website.website_name.toLowerCase().includes(search.toLowerCase()) ||
      website.website_url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || website.status === statusFilter;
    const matchesType = typeFilter === 'all' || website.website_type === typeFilter;
    const matchesEnv = envFilter === 'all' || website.environment === envFilter;
    return matchesSearch && matchesStatus && matchesType && matchesEnv;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search websites or URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wordpress">WordPress</SelectItem>
            <SelectItem value="spa">SPA</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="mobile_app">Mobile App</SelectItem>
          </SelectContent>
        </Select>
        <Select value={envFilter} onValueChange={setEnvFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-medium">Website</TableHead>
              <TableHead className="text-xs font-medium">Client</TableHead>
              <TableHead className="text-xs font-medium">Type</TableHead>
              <TableHead className="text-xs font-medium">Environment</TableHead>
              <TableHead className="text-xs font-medium">Server</TableHead>
              <TableHead className="text-xs font-medium">Status</TableHead>
              <TableHead className="text-xs font-medium text-center">SSL</TableHead>
              <TableHead className="text-xs font-medium w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No websites found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((website) => {
                const domain = mockDomains.find((d) => d.id === website.domain_id);
                const client = mockClients.find((c) => c.id === website.client_id);
                const account = mockServerAccounts.find((a) => a.id === website.server_account_id);
                const server = account ? mockServers.find((s) => s.id === account.server_id) : null;
                const ssl = getSSLStatus(website.id);

                return (
                  <TableRow
                    key={website.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onViewWebsite(website)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{website.website_name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {domain?.domain_name || website.website_url}
                          </span>
                          {website.website_url && (
                            <a
                              href={website.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client?.client_name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${typeStyles[website.website_type]}`}>
                        {website.website_type === 'mobile_app' ? 'Mobile' : website.website_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${envStyles[website.environment]}`}>
                        {website.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {server?.server_name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusStyles[website.status]}`}>
                        {website.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {ssl.ok ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewWebsite(website)}>
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

      <div className="text-xs text-muted-foreground px-1">
        Showing {filtered.length} of {mockWebsites.length} websites
      </div>
    </div>
  );
}
