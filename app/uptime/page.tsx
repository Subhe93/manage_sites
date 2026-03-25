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
import { Activity, Search, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, Filter, Wifi, WifiOff, Globe, Clock } from 'lucide-react';
import { mockUptimeChecks, mockUptimeLogs, mockWebsites } from '@/lib/mock-data';

const getWebsiteName = (websiteId: number) => {
  const website = mockWebsites.find((w) => w.id === websiteId);
  return website ? website.website_name : `Website #${websiteId}`;
};

const getWebsiteNameFromCheckId = (checkId: number) => {
  const check = mockUptimeChecks.find((c) => c.id === checkId);
  if (!check) return `Check #${checkId}`;
  return getWebsiteName(check.website_id);
};

const uptimeStatusBadge = (status: string) => {
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

export default function UptimePage() {
  const [checkSearch, setCheckSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');

  const totalChecks = mockUptimeChecks.length;
  const activeChecks = mockUptimeChecks.filter((c) => c.is_active).length;
  const inactiveChecks = mockUptimeChecks.filter((c) => !c.is_active).length;
  const upCount = mockUptimeChecks.filter((c) => c.last_status === 'up').length;
  const downCount = mockUptimeChecks.filter((c) => c.last_status === 'down').length;
  const degradedCount = mockUptimeChecks.filter((c) => c.last_status === 'degraded').length;

  const filteredChecks = mockUptimeChecks.filter((check) => {
    const websiteName = getWebsiteName(check.website_id);
    return (
      checkSearch === '' ||
      websiteName.toLowerCase().includes(checkSearch.toLowerCase()) ||
      check.check_url.toLowerCase().includes(checkSearch.toLowerCase())
    );
  });

  const filteredLogs = mockUptimeLogs.filter((log) => {
    const websiteName = getWebsiteNameFromCheckId(log.uptime_check_id);
    const matchesSearch =
      logSearch === '' ||
      websiteName.toLowerCase().includes(logSearch.toLowerCase()) ||
      String(log.uptime_check_id).includes(logSearch) ||
      String(log.status_code).includes(logSearch);
    const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uptime Monitor</h1>
          <p className="text-muted-foreground">Monitor website uptime and response times</p>
        </div>

        <Tabs defaultValue="checks">
          <TabsList>
            <TabsTrigger value="checks">Checks</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="checks" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Globe className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalChecks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <Wifi className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeChecks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <WifiOff className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveChecks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Up</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Down</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{downCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Degraded</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{degradedCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checks..."
                  value={checkSearch}
                  onChange={(e) => setCheckSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Check URL</TableHead>
                      <TableHead>Interval (min)</TableHead>
                      <TableHead>Timeout (sec)</TableHead>
                      <TableHead>Expected Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Last Check</TableHead>
                      <TableHead>Last Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">
                          {getWebsiteName(check.website_id)}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">{check.check_url}</TableCell>
                        <TableCell>{check.check_interval_minutes}</TableCell>
                        <TableCell>{check.timeout_seconds}</TableCell>
                        <TableCell>{check.expected_status_code}</TableCell>
                        <TableCell>
                          {check.is_active ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(check.last_check_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{uptimeStatusBadge(check.last_status)}</TableCell>
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
                    {filteredChecks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No checks found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {logStatusFilter === 'all' ? 'All' : logStatusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('up')}>Up</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('down')}>Down</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('degraded')}>Degraded</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check ID</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time (ms)</TableHead>
                      <TableHead>Status Code</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Checked At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">#{log.uptime_check_id}</TableCell>
                        <TableCell>{getWebsiteNameFromCheckId(log.uptime_check_id)}</TableCell>
                        <TableCell>{uptimeStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.response_time_ms}</TableCell>
                        <TableCell>{log.status_code || '-'}</TableCell>
                        <TableCell className="max-w-[250px]">
                          {log.error_message ? (
                            <span className="text-red-600">{log.error_message}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.checked_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
