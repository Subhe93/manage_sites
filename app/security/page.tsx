'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Search, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Circle as XCircle, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import { mockSecurityIncidents, mockUsers } from '@/lib/mock-data';

const severityBadge = (severity: string) => {
  switch (severity) {
    case 'low':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{severity}</Badge>;
    case 'medium':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{severity}</Badge>;
    case 'high':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{severity}</Badge>;
    case 'critical':
      return <Badge className="bg-red-500 text-white hover:bg-red-500">{severity}</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    case 'investigating':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status}</Badge>;
    case 'resolved':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{status}</Badge>;
    case 'closed':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getUserName = (userId: number | null) => {
  if (!userId) return '-';
  const user = mockUsers.find((u) => u.id === userId);
  return user ? user.full_name : '-';
};

const truncate = (text: string, maxLength: number = 40) => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function SecurityPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const openCount = mockSecurityIncidents.filter((i) => i.status === 'open').length;
  const investigatingCount = mockSecurityIncidents.filter((i) => i.status === 'investigating').length;
  const resolvedCount = mockSecurityIncidents.filter((i) => i.status === 'resolved').length;
  const closedCount = mockSecurityIncidents.filter((i) => i.status === 'closed').length;

  const filtered = mockSecurityIncidents.filter((incident) => {
    const matchesSearch =
      search === '' ||
      incident.description.toLowerCase().includes(search.toLowerCase()) ||
      incident.incident_type.toLowerCase().includes(search.toLowerCase()) ||
      incident.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      String(incident.id).includes(search);
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Incidents</h1>
          <p className="text-muted-foreground">Monitor and manage security incidents across your infrastructure</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigating</CardTitle>
              <Search className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investigatingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <ShieldAlert className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('open')}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('investigating')}>Investigating</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('resolved')}>Resolved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('closed')}>Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Severity: {severityFilter === 'all' ? 'All' : severityFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSeverityFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('low')}>Low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('high')}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('critical')}>Critical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Incident Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected At</TableHead>
                  <TableHead>Resolved At</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions Taken</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">#{incident.id}</TableCell>
                    <TableCell className="capitalize">{incident.entity_type}</TableCell>
                    <TableCell>{incident.entity_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {incident.incident_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{severityBadge(incident.severity)}</TableCell>
                    <TableCell>{statusBadge(incident.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(incident.detected_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {incident.resolved_at
                        ? new Date(incident.resolved_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px]">{truncate(incident.description)}</TableCell>
                    <TableCell className="max-w-[200px]">{truncate(incident.actions_taken)}</TableCell>
                    <TableCell>{getUserName(incident.reported_by)}</TableCell>
                    <TableCell>{getUserName(incident.assigned_to)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      No incidents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
