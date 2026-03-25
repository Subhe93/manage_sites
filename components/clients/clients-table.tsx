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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { mockClients, mockDomains, mockWebsites } from '@/lib/mock-data';
import type { Client, ClientStatus } from '@/lib/types';

const statusStyles: Record<ClientStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  inactive: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

interface ClientsTableProps {
  onViewClient: (client: Client) => void;
  statusFilter: ClientStatus | 'all';
}

export function ClientsTable({ onViewClient, statusFilter }: ClientsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = mockClients.filter((client) => {
    const matchesSearch =
      client.client_name.toLowerCase().includes(search.toLowerCase()) ||
      client.company_name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClientStats = (clientId: number) => {
    const domains = mockDomains.filter((d) => d.client_id === clientId).length;
    const websites = mockWebsites.filter((w) => w.client_id === clientId).length;
    return { domains, websites };
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-medium">Client</TableHead>
              <TableHead className="text-xs font-medium">Contact</TableHead>
              <TableHead className="text-xs font-medium">Country</TableHead>
              <TableHead className="text-xs font-medium text-center">Domains</TableHead>
              <TableHead className="text-xs font-medium text-center">Websites</TableHead>
              <TableHead className="text-xs font-medium">Status</TableHead>
              <TableHead className="text-xs font-medium">Created</TableHead>
              <TableHead className="text-xs font-medium w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No clients found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => {
                const stats = getClientStats(client.id);
                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onViewClient(client)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{client.client_name}</p>
                          <p className="text-xs text-muted-foreground">{client.company_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.country}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{stats.domains}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{stats.websites}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusStyles[client.status]}`}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.created_at}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewClient(client)}>
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
        <span>Showing {filtered.length} of {mockClients.length} clients</span>
      </div>
    </div>
  );
}
