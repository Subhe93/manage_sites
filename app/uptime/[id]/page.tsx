'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  CircleCheck as CheckCircle2,
  Circle as XCircle,
  TriangleAlert as AlertTriangle,
  Activity,
  Clock3,
  ShieldCheck,
  Globe,
  Loader2,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EndpointStats {
  totalChecks: number;
  upCount: number;
  downCount: number;
  degradedCount: number;
  uptimePercentage: number | null;
  avgResponseTimeMs: number | null;
  minResponseTimeMs: number | null;
  maxResponseTimeMs: number | null;
}

interface TimelineBucket {
  hour: string;
  up: number;
  down: number;
  degraded: number;
  total: number;
  avgResponseTimeMs: number | null;
}

interface Incident {
  checkedAt: string;
  statusCode: number | null;
  errorMessage: string | null;
  responseTimeMs: number | null;
}

interface EndpointHistory {
  checkId: number;
  checkUrl: string;
  lastStatus: string | null;
  lastCheckAt: string | null;
  stats: EndpointStats;
  timeline: TimelineBucket[];
  recentIncidents: Incident[];
}

interface HistoryData {
  website: { id: number; name: string; url: string | null };
  period: { hours: number; since: string; until: string };
  overallUptimePercentage: number | null;
  endpoints: EndpointHistory[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusIcon(status: string, className = 'h-4 w-4') {
  switch (status) {
    case 'up': return <CheckCircle2 className={`${className} text-emerald-500`} />;
    case 'down': return <XCircle className={`${className} text-red-500`} />;
    case 'degraded': return <AlertTriangle className={`${className} text-amber-500`} />;
    default: return <Activity className={`${className} text-muted-foreground`} />;
  }
}

function statusBadge(status: string) {
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

function uptimeBgColor(pct: number | null): string {
  if (pct === null) return 'bg-muted';
  if (pct >= 99.5) return 'bg-emerald-500';
  if (pct >= 95) return 'bg-amber-500';
  return 'bg-red-500';
}

function responseColor(ms: number | null): string {
  if (ms === null) return 'text-muted-foreground';
  if (ms < 500) return 'text-emerald-600';
  if (ms < 1500) return 'text-amber-600';
  return 'text-red-600';
}

function formatHour(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Timeline Bar Chart (pure CSS) ──────────────────────────────────────────

function TimelineChart({ timeline, metric }: { timeline: TimelineBucket[]; metric: 'uptime' | 'response' }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No data available for this period.</p>;
  }

  if (metric === 'response') {
    const maxMs = Math.max(...timeline.map((b) => b.avgResponseTimeMs ?? 0), 1);
    return (
      <div className="flex items-end gap-[2px] h-32">
        {timeline.map((bucket, i) => {
          const ms = bucket.avgResponseTimeMs ?? 0;
          const heightPct = Math.max((ms / maxMs) * 100, 2);
          const color = ms === 0 ? 'bg-muted' : ms < 500 ? 'bg-emerald-400' : ms < 1500 ? 'bg-amber-400' : 'bg-red-400';
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className={`w-full rounded-t ${color} transition-all`} style={{ height: `${heightPct}%` }} />
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap z-10">
                <div className="font-medium">{formatHour(bucket.hour)}</div>
                <div>{ms}ms avg</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Uptime bar chart
  return (
    <div className="flex items-end gap-[2px] h-32">
      {timeline.map((bucket, i) => {
        const total = bucket.total || 1;
        const upPct = (bucket.up / total) * 100;
        const color = upPct >= 99.5 ? 'bg-emerald-400' : upPct >= 90 ? 'bg-amber-400' : upPct > 0 ? 'bg-red-400' : 'bg-muted';
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div className={`w-full rounded-t ${color} transition-all`} style={{ height: `${Math.max(upPct, 2)}%` }} />
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap z-10">
              <div className="font-medium">{formatHour(bucket.hour)}</div>
              <div>{bucket.up} up / {bucket.down} down / {bucket.degraded} degraded</div>
              <div>{Math.round(upPct)}% uptime</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function UptimeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState('24');
  const [chartMetric, setChartMetric] = useState<'uptime' | 'response'>('response');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/uptime/${id}/history?hours=${hours}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to load');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [id, hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading uptime history...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/uptime" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Uptime Monitor
        </Link>
        <div className="text-center py-12 text-destructive">{error || 'No data'}</div>
      </div>
    );
  }

  const totalChecks = data.endpoints.reduce((s, e) => s + e.stats.totalChecks, 0);
  const totalDown = data.endpoints.reduce((s, e) => s + e.stats.downCount, 0);
  const allAvgResponse = data.endpoints
    .map((e) => e.stats.avgResponseTimeMs)
    .filter((v): v is number => v !== null);
  const overallAvgResponse = allAvgResponse.length > 0
    ? Math.round(allAvgResponse.reduce((s, v) => s + v, 0) / allAvgResponse.length)
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/uptime" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Uptime Monitor
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {data.website.name}
            {data.overallUptimePercentage !== null && (
              <Badge variant="outline" className={`text-sm ${uptimeColor(data.overallUptimePercentage)}`}>
                {data.overallUptimePercentage}% uptime
              </Badge>
            )}
          </h1>
          {data.website.url && (
            <p className="text-muted-foreground font-mono text-sm mt-1">{data.website.url}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 hours</SelectItem>
              <SelectItem value="12">Last 12 hours</SelectItem>
              <SelectItem value="24">Last 24 hours</SelectItem>
              <SelectItem value="72">Last 3 days</SelectItem>
              <SelectItem value="168">Last 7 days</SelectItem>
              <SelectItem value="720">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${uptimeColor(data.overallUptimePercentage)}`}>
              {data.overallUptimePercentage !== null ? `${data.overallUptimePercentage}%` : 'N/A'}
            </div>
            <Progress value={data.overallUptimePercentage ?? 0} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${responseColor(overallAvgResponse)}`}>
              {overallAvgResponse !== null ? `${overallAvgResponse}ms` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDown > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {totalDown}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-endpoint details */}
      {data.endpoints.map((endpoint) => (
        <Card key={endpoint.checkId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {statusIcon(endpoint.lastStatus || 'unknown', 'h-5 w-5')}
                <div>
                  <CardTitle className="text-base font-mono">{endpoint.checkUrl}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1">
                    <span>Uptime: <strong className={uptimeColor(endpoint.stats.uptimePercentage)}>{endpoint.stats.uptimePercentage ?? 'N/A'}%</strong></span>
                    <span>Avg: <strong className={responseColor(endpoint.stats.avgResponseTimeMs)}>{endpoint.stats.avgResponseTimeMs ?? '-'}ms</strong></span>
                    <span>Min: <strong>{endpoint.stats.minResponseTimeMs ?? '-'}ms</strong></span>
                    <span>Max: <strong>{endpoint.stats.maxResponseTimeMs ?? '-'}ms</strong></span>
                  </CardDescription>
                </div>
              </div>
              {endpoint.lastStatus && statusBadge(endpoint.lastStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mini stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{endpoint.stats.upCount} up</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>{endpoint.stats.downCount} down</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{endpoint.stats.degradedCount} degraded</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as 'uptime' | 'response')}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response">Response Time</SelectItem>
                    <SelectItem value="uptime">Uptime %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Uptime bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{chartMetric === 'response' ? 'Response Time (per hour)' : 'Uptime (per hour)'}</span>
                <span>{endpoint.timeline.length} hours</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border">
                <TimelineChart timeline={endpoint.timeline} metric={chartMetric} />
              </div>
              {endpoint.timeline.length > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatHour(endpoint.timeline[0].hour)}</span>
                  <span>{formatHour(endpoint.timeline[endpoint.timeline.length - 1].hour)}</span>
                </div>
              )}
            </div>

            {/* Recent incidents */}
            {endpoint.recentIncidents.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Recent Incidents ({endpoint.recentIncidents.length})
                </h4>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Status Code</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {endpoint.recentIncidents.slice().reverse().map((inc, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(inc.checkedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {inc.statusCode ?? 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {inc.responseTimeMs !== null ? `${inc.responseTimeMs}ms` : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-destructive max-w-[300px] truncate">
                            {inc.errorMessage || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {data.endpoints.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No uptime checks found for this website.</p>
            <p className="text-sm mt-1">Run a live check from the main uptime page to start monitoring.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
