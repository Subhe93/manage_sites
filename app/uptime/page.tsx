'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  ShieldCheck,
  ExternalLink,
  Activity,
  Eye,
  Zap,
  SquareArrowOutUpRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MonitorStatus, UptimeWebsite, useUptimeMonitor } from '@/hooks/use-uptime-monitor';

type SortKey = 'websiteName' | 'status' | 'uptime' | 'avgResponse' | 'checkedEndpoints';

// ─── Status helpers ──────────────────────────────────────────────────────────

function statusIcon(status: MonitorStatus, className = 'h-4 w-4') {
  switch (status) {
    case 'up': return <CheckCircle2 className={`${className} text-emerald-500`} />;
    case 'down': return <XCircle className={`${className} text-red-500`} />;
    case 'degraded': return <AlertTriangle className={`${className} text-amber-500`} />;
    default: return <Activity className={`${className} text-muted-foreground`} />;
  }
}

function statusBadge(status: MonitorStatus) {
  const map: Record<string, string> = {
    up: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    down: 'bg-red-500/10 text-red-600 border-red-200',
    degraded: 'bg-amber-500/10 text-amber-600 border-amber-200',
  };
  return (
    <Badge variant="outline" className={`gap-1.5 ${map[status] || ''}`}>
      {statusIcon(status, 'h-3 w-3')}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function uptimeColor(pct: number | null): string {
  if (pct === null) return 'text-muted-foreground';
  if (pct >= 99.5) return 'text-emerald-600';
  if (pct >= 95) return 'text-amber-600';
  return 'text-red-600';
}

function uptimeProgressColor(pct: number | null): string {
  if (pct === null) return 'bg-muted';
  if (pct >= 99.5) return 'bg-emerald-500';
  if (pct >= 95) return 'bg-amber-500';
  return 'bg-red-500';
}

function responseTimeBadge(ms: number | null) {
  if (ms === null) return <span className="text-muted-foreground">-</span>;
  const color = ms < 500 ? 'text-emerald-600' : ms < 1500 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-mono text-sm ${color}`}>{ms}ms</span>;
}

function endpointTypeBadge(type: 'primary' | 'subdomain' | 'api') {
  if (type === 'primary') return <Badge variant="outline" className="text-xs">Main</Badge>;
  if (type === 'subdomain') return <Badge variant="secondary" className="text-xs">Sub</Badge>;
  return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">API</Badge>;
}

function getMainEndpoint(website: UptimeWebsite) {
  return website.endpoints.find((e) => e.type === 'primary') || website.endpoints[0] || null;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function UptimePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MonitorStatus>('all');
  const [sortBy, setSortBy] = useState<SortKey>('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const { websites, stats, mode, loading, error, refreshing, runLiveCheck, refresh } = useUptimeMonitor();
  const [detailWebsite, setDetailWebsite] = useState<UptimeWebsite | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [checkingWebsiteId, setCheckingWebsiteId] = useState<number | null>(null);

  const openDetails = useCallback(async (website: UptimeWebsite) => {
    setDetailWebsite(website);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/uptime/${website.websiteId}/details`);
      const json = await res.json();
      if (json.success) setDetailData(json.data);
    } catch { /* ignore */ } finally {
      setDetailLoading(false);
    }
  }, []);

  const quickCheck = useCallback(async (websiteId: number) => {
    setCheckingWebsiteId(websiteId);
    try {
      const res = await fetch(`/api/uptime/${websiteId}/check`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success(`${json.data.websiteName}: ${json.data.websiteStatus.toUpperCase()}`);
        refresh();
      } else {
        toast.error('Check failed');
      }
    } catch {
      toast.error('Quick check failed');
    } finally {
      setCheckingWebsiteId(null);
    }
  }, [refresh]);

  const toggleCheckSubdomains = async (websiteId: number, current: boolean) => {
    try {
      const res = await fetch(`/api/uptime/${websiteId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkSubdomains: !current }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.meta?.message || 'Setting updated');
        refresh();
      }
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const filteredWebsites = useMemo(() => {
    const query = search.trim().toLowerCase();
    return websites.filter((website) => {
      const matchesStatus = statusFilter === 'all' || website.websiteStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      return (
        website.websiteName.toLowerCase().includes(query) ||
        website.endpoints.some((e) => e.url.toLowerCase().includes(query) || e.label.toLowerCase().includes(query))
      );
    });
  }, [websites, search, statusFilter]);

  const sortedWebsites = useMemo(() => {
    const statusRank: Record<string, number> = { down: 1, degraded: 2, unknown: 3, up: 4 };

    return [...filteredWebsites].sort((a, b) => {
      let compare = 0;
      switch (sortBy) {
        case 'websiteName':
          compare = a.websiteName.localeCompare(b.websiteName);
          break;
        case 'status':
          compare = (statusRank[a.websiteStatus] ?? 3) - (statusRank[b.websiteStatus] ?? 3);
          break;
        case 'uptime':
          compare = (a.uptimePercentage24h ?? -1) - (b.uptimePercentage24h ?? -1);
          break;
        case 'avgResponse':
          compare = (a.avgResponseTimeMs ?? Infinity) - (b.avgResponseTimeMs ?? Infinity);
          break;
        case 'checkedEndpoints':
          compare = a.checkedEndpoints - b.checkedEndpoints;
          break;
      }
      return sortOrder === 'asc' ? compare : -compare;
    });
  }, [filteredWebsites, sortBy, sortOrder]);

  const toggleRow = (id: number) => setExpandedRows((p) => ({ ...p, [id]: !p[id] }));

  return (
    <>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uptime Monitor</h1>
          <p className="text-muted-foreground">Real-time website health and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Activity className="h-3 w-3" />
            {mode === 'live' ? 'Live' : 'Cached'}
          </Badge>
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={runLiveCheck} disabled={loading || refreshing}>
            <Globe className="h-4 w-4 mr-1.5" />
            {refreshing ? 'Checking...' : 'Run Live Check'}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="lg:col-span-2 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Uptime (24h)</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${uptimeColor(stats.overallUptime24h)}`}>
              {stats.overallUptime24h !== null ? `${stats.overallUptime24h}%` : 'N/A'}
            </div>
            <Progress
              value={stats.overallUptime24h ?? 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Websites</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalWebsites}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Link2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalEndpoints}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Up</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{stats.up}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.down}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageResponseTimeMs !== null ? `${stats.averageResponseTimeMs}ms` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search websites or URLs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="up">Up</SelectItem>
              <SelectItem value="down">Down</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status (Issues first)</SelectItem>
              <SelectItem value="websiteName">Website Name</SelectItem>
              <SelectItem value="uptime">Uptime %</SelectItem>
              <SelectItem value="avgResponse">Avg Response</SelectItem>
              <SelectItem value="checkedEndpoints">Endpoints</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setSortOrder((p) => p === 'asc' ? 'desc' : 'asc')}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Website Status
            {refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading uptime data...</p>
            </div>
          )}
          {!loading && error && <div className="text-destructive py-4 text-center">{error}</div>}

          {!loading && !error && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Website</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime (24h)</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Endpoints</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWebsites.map((website) => {
                    const mainEndpoint = getMainEndpoint(website);
                    const isExpanded = expandedRows[website.websiteId] || false;

                    return (
                      <> 
                        <TableRow
                          key={`main-${website.websiteId}`}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleRow(website.websiteId)}
                        >
                          <TableCell>
                            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{website.websiteName}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                                {mainEndpoint?.url || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{statusBadge(website.websiteStatus)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${uptimeProgressColor(website.uptimePercentage24h)}`}
                                  style={{ width: `${website.uptimePercentage24h ?? 0}%` }}
                                />
                              </div>
                              <span className={`text-sm font-mono font-medium ${uptimeColor(website.uptimePercentage24h)}`}>
                                {website.uptimePercentage24h !== null ? `${website.uptimePercentage24h}%` : 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{responseTimeBadge(website.avgResponseTimeMs)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{website.checkedEndpoints}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(website.lastCheckAt)}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/uptime/${website.websiteId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`detail-${website.websiteId}`}>
                            <TableCell colSpan={8} className="bg-muted/30 px-8 py-3">
                              {website.endpoints.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">No endpoints configured.</p>
                              ) : (
                                <div className="space-y-2">
                                  {website.endpoints.map((ep, i) => (
                                    <div
                                      key={`${website.websiteId}-${ep.url}-${i}`}
                                      className="flex items-center gap-3 py-1.5 px-3 rounded-md bg-background border text-sm"
                                    >
                                      {statusIcon(ep.status, 'h-3.5 w-3.5')}
                                      {endpointTypeBadge(ep.type)}
                                      <span className="font-medium min-w-[100px]">{ep.label}</span>
                                      <span className="text-muted-foreground truncate flex-1 font-mono text-xs">{ep.url}</span>
                                      {responseTimeBadge(ep.responseTimeMs)}
                                      <span className="text-xs text-muted-foreground min-w-[50px]">
                                        {ep.statusCode ?? '-'}
                                      </span>
                                      {ep.uptimePercentage24h !== null && (
                                        <span className={`text-xs font-mono ${uptimeColor(ep.uptimePercentage24h)}`}>
                                          {ep.uptimePercentage24h}%
                                        </span>
                                      )}
                                      {ep.errorMessage && (
                                        <span className="text-xs text-destructive truncate max-w-[200px]" title={ep.errorMessage}>
                                          {ep.errorMessage}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">Check subdomains</span>
                                  <Switch
                                    checked={website.checkSubdomains}
                                    onCheckedChange={() => toggleCheckSubdomains(website.websiteId, website.checkSubdomains)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(mainEndpoint?.url || '#', '_blank');
                                          }}
                                        >
                                          <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Open website</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDetails(website);
                                          }}
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Website details</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          disabled={checkingWebsiteId === website.websiteId}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            quickCheck(website.websiteId);
                                          }}
                                        >
                                          {checkingWebsiteId === website.websiteId
                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            : <Zap className="h-3.5 w-3.5" />
                                          }
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Quick check</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}

                  {sortedWebsites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                        {websites.length === 0
                          ? 'No websites with URLs found. Add website URLs to start monitoring.'
                          : 'No websites match the current filters.'}
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

    {/* Website Detail Dialog */}
    {detailWebsite && (
    <Dialog open={!!detailWebsite} onOpenChange={(open) => !open && setDetailWebsite(null)}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {statusIcon(detailWebsite.websiteStatus, 'h-5 w-5')}
            {detailWebsite.websiteName}
          </DialogTitle>
        </DialogHeader>

        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : detailData ? (
          <div className="space-y-4 text-sm">
            {/* Uptime Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-muted-foreground text-xs">Status</div>
                <div className="mt-1">{statusBadge(detailWebsite.websiteStatus)}</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-muted-foreground text-xs">Uptime 24h</div>
                <div className={`mt-1 font-bold ${uptimeColor(detailWebsite.uptimePercentage24h)}`}>
                  {detailWebsite.uptimePercentage24h !== null ? `${detailWebsite.uptimePercentage24h}%` : 'N/A'}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-muted-foreground text-xs">Avg Response</div>
                <div className="mt-1 font-bold">
                  {detailWebsite.avgResponseTimeMs !== null ? `${detailWebsite.avgResponseTimeMs}ms` : '-'}
                </div>
              </div>
            </div>

            {/* Website Info */}
            <div className="rounded-lg border p-3 space-y-1.5">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Website Info</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {detailData.websiteUrl && <><span className="text-muted-foreground">URL</span><span className="font-mono text-xs break-all">{detailData.websiteUrl}</span></>}
                {detailData.adminUrl && <><span className="text-muted-foreground">Admin URL</span><span className="font-mono text-xs break-all">{detailData.adminUrl}</span></>}
                {detailData.apiEndpoint && <><span className="text-muted-foreground">API Endpoint</span><span className="font-mono text-xs break-all">{detailData.apiEndpoint}</span></>}
                <span className="text-muted-foreground">Type</span><span>{detailData.websiteType}</span>
                {detailData.framework && <><span className="text-muted-foreground">Framework</span><span>{detailData.framework}</span></>}
                <span className="text-muted-foreground">Environment</span><span>{detailData.environment}</span>
                {detailData.databaseType && <><span className="text-muted-foreground">Database</span><span>{detailData.databaseType}{detailData.databaseName ? ` (${detailData.databaseName})` : ''}</span></>}
              </div>
            </div>

            {/* Server */}
            {detailData.server && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Server</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Name</span><span className="font-medium">{detailData.server.serverName}</span>
                  {detailData.server.ipAddress && <><span className="text-muted-foreground">IP</span><span className="font-mono">{detailData.server.ipAddress}</span></>}
                  {detailData.server.serverType && <><span className="text-muted-foreground">Type</span><span>{detailData.server.serverType}</span></>}
                  {detailData.server.operatingSystem && <><span className="text-muted-foreground">OS</span><span>{detailData.server.operatingSystem}</span></>}
                  {detailData.server.controlPanel && <><span className="text-muted-foreground">Panel</span><span>{detailData.server.controlPanel}</span></>}
                  {detailData.server.controlPanelUrl && <><span className="text-muted-foreground">Panel URL</span><a href={detailData.server.controlPanelUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-mono text-xs break-all">{detailData.server.controlPanelUrl}</a></>}
                  {detailData.server.location && <><span className="text-muted-foreground">Location</span><span>{detailData.server.location}</span></>}
                  {detailData.server.provider?.providerName && <><span className="text-muted-foreground">Provider</span><span>{detailData.server.provider.providerName}</span></>}
                </div>
              </div>
            )}

            {/* Server Account */}
            {detailData.serverAccount && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Server Account</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Account</span><span className="font-medium">{detailData.serverAccount.accountName}</span>
                  <span className="text-muted-foreground">Username</span><span className="font-mono">{detailData.serverAccount.username}</span>
                  <span className="text-muted-foreground">Access</span><span>{detailData.serverAccount.accessLevel}</span>
                  {detailData.serverAccount.controlPanelUrl && <><span className="text-muted-foreground">Panel URL</span><a href={detailData.serverAccount.controlPanelUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-mono text-xs break-all">{detailData.serverAccount.controlPanelUrl}</a></>}
                  <span className="text-muted-foreground">SSH Port</span><span>{detailData.serverAccount.sshPort}</span>
                  <span className="text-muted-foreground">FTP Port</span><span>{detailData.serverAccount.ftpPort}</span>
                </div>
              </div>
            )}

            {/* Client */}
            {detailData.client && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Client</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Name</span><span className="font-medium">{detailData.client.clientName}</span>
                  {detailData.client.companyName && <><span className="text-muted-foreground">Company</span><span>{detailData.client.companyName}</span></>}
                  {detailData.client.email && <><span className="text-muted-foreground">Email</span><span>{detailData.client.email}</span></>}
                  {detailData.client.phone && <><span className="text-muted-foreground">Phone</span><span>{detailData.client.phone}</span></>}
                </div>
              </div>
            )}

            {/* Domain */}
            {detailData.domain && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Domain</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Domain</span><span className="font-medium">{detailData.domain.domainName}</span>
                  {detailData.domain.expiryDate && <><span className="text-muted-foreground">Expires</span><span>{new Date(detailData.domain.expiryDate).toLocaleDateString()}</span></>}
                </div>
              </div>
            )}

            {/* Credentials */}
            {detailData.credentials?.length > 0 && (
              <div className="rounded-lg border p-3 space-y-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Credentials</h4>
                {detailData.credentials.map((cred: any) => (
                  <div key={cred.id} className="rounded border p-2 space-y-1 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{cred.credentialType}</Badge>
                      {cred.accessUrl && <a href={cred.accessUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-mono text-xs truncate">{cred.accessUrl}</a>}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {cred.username && <><span className="text-muted-foreground">Username</span><span className="font-mono">{cred.username}</span></>}
                      {cred.passwordEncrypted && <><span className="text-muted-foreground">Password</span><span className="font-mono">{cred.passwordEncrypted}</span></>}
                      {cred.additionalInfo && <><span className="text-muted-foreground">Info</span><span>{cred.additionalInfo}</span></>}
                      {cred.notes && <><span className="text-muted-foreground">Notes</span><span>{cred.notes}</span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subdomains */}
            {detailData.subdomains?.length > 0 && (
              <div className="rounded-lg border p-3 space-y-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Subdomains ({detailData.subdomains.length})</h4>
                {detailData.subdomains.map((sub: any, i: number) => (
                  <div key={i} className="rounded border p-2 space-y-0.5 bg-muted/30 text-xs">
                    <div className="font-medium">{sub.subdomainName}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {sub.fullUrl && <><span className="text-muted-foreground">URL</span><span className="font-mono break-all">{sub.fullUrl}</span></>}
                      {sub.adminUrl && <><span className="text-muted-foreground">Admin</span><span className="font-mono break-all">{sub.adminUrl}</span></>}
                      {sub.adminUsername && <><span className="text-muted-foreground">Username</span><span className="font-mono">{sub.adminUsername}</span></>}
                      {sub.adminPassword && <><span className="text-muted-foreground">Password</span><span className="font-mono">{sub.adminPassword}</span></>}
                      {sub.websiteType && <><span className="text-muted-foreground">Type</span><span>{sub.websiteType}</span></>}
                      {sub.framework && <><span className="text-muted-foreground">Framework</span><span>{sub.framework}</span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {detailData.notes && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Notes</h4>
                <p className="text-xs whitespace-pre-wrap">{detailData.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(
                  detailData.adminUrl || detailData.websiteUrl || detailWebsite.endpoints.find((e) => e.type === 'primary')?.url || '#',
                  '_blank'
                )}
              >
                <SquareArrowOutUpRight className="h-3.5 w-3.5 mr-1.5" />
                Open Website
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={checkingWebsiteId === detailWebsite.websiteId}
                onClick={() => quickCheck(detailWebsite.websiteId)}
              >
                {checkingWebsiteId === detailWebsite.websiteId
                  ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  : <Zap className="h-3.5 w-3.5 mr-1.5" />
                }
                Quick Check
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">Failed to load details.</p>
        )}
      </DialogContent>
    </Dialog>
    )}
  </>
  );
}
