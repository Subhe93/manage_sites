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
import { Wrench, Search, CircleCheck as CheckCircle2, Circle as XCircle, Clock, MoveHorizontal as MoreHorizontal, Eye, Pencil, Trash2, Filter, CalendarClock, Activity, Pause } from 'lucide-react';
import {
  mockMaintenanceSchedules,
  mockMaintenanceLogs,
  mockServers,
  mockWebsites,
  mockUsers,
} from '@/lib/mock-data';

const getEntityName = (entityType: string, entityId: number) => {
  if (entityType === 'server') {
    const server = mockServers.find((s) => s.id === entityId);
    return server ? server.server_name : `Server #${entityId}`;
  }
  if (entityType === 'website') {
    const website = mockWebsites.find((w) => w.id === entityId);
    return website ? website.website_name : `Website #${entityId}`;
  }
  return `${entityType} #${entityId}`;
};

const getUserName = (userId: number | null) => {
  if (!userId) return 'Automated';
  const user = mockUsers.find((u) => u.id === userId);
  return user ? user.full_name : 'Automated';
};

const typeBadge = (type: string) => {
  const colors: Record<string, string> = {
    backup: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    update: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    security_scan: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    performance_check: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    other: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  };
  return (
    <Badge className={colors[type] || colors.other}>
      {type.replace('_', ' ')}
    </Badge>
  );
};

const frequencyBadge = (frequency: string) => {
  const colors: Record<string, string> = {
    daily: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    weekly: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    monthly: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    quarterly: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    yearly: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
    custom: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  };
  return (
    <Badge className={colors[frequency] || colors.custom}>
      {frequency}
    </Badge>
  );
};

const logStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{status}</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
    case 'partial':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status}</Badge>;
    case 'skipped':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const dayOfWeekName = (day: number | null) => {
  if (day === null) return '-';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || '-';
};

export default function MaintenancePage() {
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');

  const activeSchedules = mockMaintenanceSchedules.filter((s) => s.is_active).length;
  const inactiveSchedules = mockMaintenanceSchedules.filter((s) => !s.is_active).length;
  const dailyCount = mockMaintenanceSchedules.filter((s) => s.schedule_frequency === 'daily').length;
  const weeklyCount = mockMaintenanceSchedules.filter((s) => s.schedule_frequency === 'weekly').length;
  const monthlyCount = mockMaintenanceSchedules.filter((s) => s.schedule_frequency === 'monthly').length;

  const successLogs = mockMaintenanceLogs.filter((l) => l.status === 'success').length;
  const failedLogs = mockMaintenanceLogs.filter((l) => l.status === 'failed').length;
  const partialLogs = mockMaintenanceLogs.filter((l) => l.status === 'partial').length;
  const skippedLogs = mockMaintenanceLogs.filter((l) => l.status === 'skipped').length;

  const filteredSchedules = mockMaintenanceSchedules.filter((schedule) => {
    const entityName = getEntityName(schedule.entity_type, schedule.entity_id);
    return (
      scheduleSearch === '' ||
      entityName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      schedule.maintenance_type.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      schedule.entity_type.toLowerCase().includes(scheduleSearch.toLowerCase())
    );
  });

  const filteredLogs = mockMaintenanceLogs.filter((log) => {
    const entityName = getEntityName(log.entity_type, log.entity_id);
    const matchesSearch =
      logSearch === '' ||
      entityName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.maintenance_type.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Manage maintenance schedules and view maintenance logs</p>
        </div>

        <Tabs defaultValue="schedules">
          <TabsList>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSchedules}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <Pause className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveSchedules}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily</CardTitle>
                  <CalendarClock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly</CardTitle>
                  <CalendarClock className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly</CardTitle>
                  <CalendarClock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schedules..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Day of Week/Month</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="capitalize">{schedule.entity_type}</TableCell>
                        <TableCell className="font-medium">
                          {getEntityName(schedule.entity_type, schedule.entity_id)}
                        </TableCell>
                        <TableCell>{typeBadge(schedule.maintenance_type)}</TableCell>
                        <TableCell>{frequencyBadge(schedule.schedule_frequency)}</TableCell>
                        <TableCell>{schedule.schedule_time}</TableCell>
                        <TableCell>
                          {schedule.schedule_day_of_week !== null
                            ? dayOfWeekName(schedule.schedule_day_of_week)
                            : schedule.schedule_day_of_month !== null
                              ? `Day ${schedule.schedule_day_of_month}`
                              : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {schedule.last_run_date
                            ? new Date(schedule.last_run_date).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(schedule.next_run_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {schedule.is_active ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{schedule.notes || '-'}</TableCell>
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
                    {filteredSchedules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          No schedules found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{successLogs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{failedLogs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partial</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{partialLogs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                  <Clock className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{skippedLogs}</div>
                </CardContent>
              </Card>
            </div>

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
                  <DropdownMenuItem onClick={() => setLogStatusFilter('success')}>Success</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('failed')}>Failed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('partial')}>Partial</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogStatusFilter('skipped')}>Skipped</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Error Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {getEntityName(log.entity_type, log.entity_id)}
                        </TableCell>
                        <TableCell>{typeBadge(log.maintenance_type)}</TableCell>
                        <TableCell>{logStatusBadge(log.status)}</TableCell>
                        <TableCell>{getUserName(log.performed_by)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.start_time).toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.end_time).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.duration_minutes} min</TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.details || '-'}</TableCell>
                        <TableCell className="max-w-[200px]">
                          {log.error_message ? (
                            <span className="text-red-600">{log.error_message}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
