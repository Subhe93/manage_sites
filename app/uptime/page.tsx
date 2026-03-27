'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  CircleCheck as CheckCircle2,
  Circle as XCircle,
  TriangleAlert as AlertTriangle,
  Globe,
  Clock3,
  Link2,
  RefreshCcw,
  Loader2,
  Server,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { MonitorStatus, UptimeWebsite, useUptimeMonitor } from '@/hooks/use-uptime-monitor';

type SortKey = 'websiteName' | 'status' | 'mainResponse' | 'avgResponse' | 'checkedEndpoints';

const uptimeStatusBadge = (status: MonitorStatus) => {
  switch (status) {
    case 'up':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{status}</Badge>;
    case 'down':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    case 'degraded':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function endpointTypeBadge(type: 'primary' | 'subdomain' | 'api') {
  if (type === 'primary') return <Badge variant="outline">Main</Badge>;
  if (type === 'subdomain') return <Badge variant="secondary">Subdomain</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">API</Badge>;
}

function getMainEndpoint(website: UptimeWebsite) {
  return website.endpoints.find((endpoint) => endpoint.type === 'primary') || website.endpoints[0] || null;
}

function getOtherEndpoints(website: UptimeWebsite) {
  const main = getMainEndpoint(website);
  return website.endpoints.filter((endpoint) => endpoint !== main);
}

function rowLoadingCell() {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Checking...
    </span>
  );
}

export default function UptimePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MonitorStatus>('all');
  const [sortBy, setSortBy] = useState<SortKey>('websiteName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const { websites, stats, loading, error, refreshing, runLiveCheck } = useUptimeMonitor();

  const filteredWebsites = useMemo(() => {
    const query = search.trim().toLowerCase();

    return websites.filter((website) => {
      const matchesStatus = statusFilter === 'all' || website.websiteStatus === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      const websiteMatch = website.websiteName.toLowerCase().includes(query);
      const endpointMatch = website.endpoints.some((endpoint) =>
        endpoint.url.toLowerCase().includes(query) || endpoint.label.toLowerCase().includes(query)
      );

      return websiteMatch || endpointMatch;
    });
  }, [websites, search, statusFilter]);

  const sortedWebsites = useMemo(() => {
    const statusRank: Record<MonitorStatus, number> = { up: 1, degraded: 2, down: 3 };

    const sorted = [...filteredWebsites].sort((a, b) => {
      const aMain = getMainEndpoint(a);
      const bMain = getMainEndpoint(b);

      let compare = 0;

      switch (sortBy) {
        case 'websiteName':
          compare = a.websiteName.localeCompare(b.websiteName);
          break;
        case 'status':
          compare = statusRank[a.websiteStatus] - statusRank[b.websiteStatus];
          break;
        case 'mainResponse':
          compare = (aMain?.responseTimeMs ?? Number.MAX_SAFE_INTEGER) - (bMain?.responseTimeMs ?? Number.MAX_SAFE_INTEGER);
          break;
        case 'avgResponse':
          compare = (a.avgResponseTimeMs ?? Number.MAX_SAFE_INTEGER) - (b.avgResponseTimeMs ?? Number.MAX_SAFE_INTEGER);
          break;
        case 'checkedEndpoints':
          compare = a.checkedEndpoints - b.checkedEndpoints;
          break;
      }

      return sortOrder === 'asc' ? compare : -compare;
    });

    return sorted;
  }, [filteredWebsites, sortBy, sortOrder]);

  const toggleRow = (websiteId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [websiteId]: !prev[websiteId],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uptime Monitor</h1>
          <p className="text-muted-foreground">Monitor website uptime and response times</p>
        </div>
        <Button onClick={runLiveCheck} disabled={loading || refreshing} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          {refreshing ? 'Running checks...' : 'Run Live Check'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Websites</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWebsites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Link2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEndpoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTimeMs ?? '-'}{stats.averageResponseTimeMs !== null ? 'ms' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Up</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.up}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.down}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.degraded}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search websites or links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | MonitorStatus)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="up">Up</SelectItem>
              <SelectItem value="down">Down</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="websiteName">Website Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="mainResponse">Main Response</SelectItem>
              <SelectItem value="avgResponse">Avg Response</SelectItem>
              <SelectItem value="checkedEndpoints">Endpoints Count</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Website Uptime Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-muted-foreground py-8 text-center">Loading uptime monitor...</div>}
          {!loading && error && <div className="text-destructive py-4 text-center">{error}</div>}

          {!loading && !error && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Website</TableHead>
                    <TableHead>Main URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Main Response</TableHead>
                    <TableHead>Endpoints</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWebsites.map((website) => {
                    const mainEndpoint = getMainEndpoint(website);
                    const otherEndpoints = getOtherEndpoints(website);
                    const isExpanded = expandedRows[website.websiteId] || false;

                    return (
                      <>
                        <TableRow key={`main-${website.websiteId}`} className="cursor-pointer" onClick={() => toggleRow(website.websiteId)}>
                          <TableCell>
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </TableCell>
                          <TableCell className="font-medium">{website.websiteName}</TableCell>
                          <TableCell className="max-w-[300px] truncate">{mainEndpoint?.url || '-'}</TableCell>
                          <TableCell>{refreshing ? rowLoadingCell() : uptimeStatusBadge(website.websiteStatus)}</TableCell>
                          <TableCell>
                            {refreshing
                              ? rowLoadingCell()
                              : <>{mainEndpoint?.responseTimeMs ?? '-'}{mainEndpoint?.responseTimeMs !== null && mainEndpoint?.responseTimeMs !== undefined ? 'ms' : ''}</>}
                          </TableCell>
                          <TableCell>{website.checkedEndpoints}</TableCell>
                          <TableCell>
                            {refreshing
                              ? rowLoadingCell()
                              : <>{website.avgResponseTimeMs ?? '-'}{website.avgResponseTimeMs !== null ? 'ms' : ''}</>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {refreshing ? rowLoadingCell() : mainEndpoint ? new Date(mainEndpoint.checkedAt).toLocaleString() : '-'}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`details-${website.websiteId}`}>
                            <TableCell colSpan={8} className="bg-muted/30">
                              {otherEndpoints.length === 0 ? (
                                <div className="py-3 text-sm text-muted-foreground">No additional links for this website.</div>
                              ) : (
                                <div className="py-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Response</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Last Check</TableHead>
                                        <TableHead>Error</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {otherEndpoints.map((endpoint, index) => (
                                        <TableRow key={`${website.websiteId}-${endpoint.url}-${index}`}>
                                          <TableCell>{endpointTypeBadge(endpoint.type)}</TableCell>
                                          <TableCell className="font-medium">{endpoint.label}</TableCell>
                                          <TableCell className="max-w-[300px] truncate">{endpoint.url}</TableCell>
                                          <TableCell>{refreshing ? rowLoadingCell() : uptimeStatusBadge(endpoint.status)}</TableCell>
                                          <TableCell>
                                            {refreshing
                                              ? rowLoadingCell()
                                              : <>{endpoint.responseTimeMs ?? '-'}{endpoint.responseTimeMs !== null ? 'ms' : ''}</>}
                                          </TableCell>
                                          <TableCell>{refreshing ? rowLoadingCell() : endpoint.statusCode ?? '-'}</TableCell>
                                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {refreshing ? rowLoadingCell() : new Date(endpoint.checkedAt).toLocaleString()}
                                          </TableCell>
                                          <TableCell className="max-w-[220px] truncate text-xs text-destructive">
                                            {refreshing ? rowLoadingCell() : endpoint.errorMessage || '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}

                  {sortedWebsites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No websites match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
