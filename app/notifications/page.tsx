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
import { Bell, Search, TriangleAlert as AlertTriangle, Info, OctagonAlert as AlertOctagon, MoveHorizontal as MoreHorizontal, Eye, CheckCheck, Trash2, Filter, Mail, MailOpen } from 'lucide-react';
import { mockNotifications, mockUsers } from '@/lib/mock-data';

const severityBadge = (severity: string) => {
  switch (severity) {
    case 'info':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{severity}</Badge>;
    case 'warning':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{severity}</Badge>;
    case 'critical':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{severity}</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

const truncate = (text: string, maxLength: number = 50) => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function NotificationsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const totalCount = mockNotifications.length;
  const unreadCount = mockNotifications.filter((n) => !n.is_read).length;
  const criticalCount = mockNotifications.filter((n) => n.severity === 'critical').length;
  const warningCount = mockNotifications.filter((n) => n.severity === 'warning').length;
  const infoCount = mockNotifications.filter((n) => n.severity === 'info').length;

  const filtered = mockNotifications.filter((notification) => {
    const matchesSearch =
      search === '' ||
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase()) ||
      notification.notification_type.toLowerCase().includes(search.toLowerCase()) ||
      notification.entity_type.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || notification.severity === severityFilter;
    const matchesRead =
      readFilter === 'all' ||
      (readFilter === 'read' && notification.is_read) ||
      (readFilter === 'unread' && !notification.is_read);
    return matchesSearch && matchesSeverity && matchesRead;
  });

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View and manage system notifications and alerts</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warningCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
              <Info className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{infoCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Severity: {severityFilter === 'all' ? 'All' : severityFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSeverityFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('info')}>Info</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('warning')}>Warning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter('critical')}>Critical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MailOpen className="h-4 w-4" />
                Read: {readFilter === 'all' ? 'All' : readFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setReadFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReadFilter('read')}>Read</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReadFilter('unread')}>Unread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-[250px]">{truncate(notification.message)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {notification.notification_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{notification.entity_type}</TableCell>
                    <TableCell>{severityBadge(notification.severity)}</TableCell>
                    <TableCell>
                      {notification.is_read ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(notification.created_at).toLocaleDateString()}
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
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark as Read
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
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No notifications found.
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
