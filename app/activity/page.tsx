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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Search, MoveHorizontal as MoreHorizontal, Eye, CirclePlus as PlusCircle, Pencil, Trash2, LogIn, LogOut, FileDown, FileUp, History } from 'lucide-react';
import { useActivityLogs } from '@/hooks/use-activity-logs';

function getActionBadgeClass(actionType: string): string {
  switch (actionType) {
    case 'create':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'update':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'delete':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'login':
      return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    case 'logout':
      return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

const actionTypes = ['all', 'create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import'] as const;

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { activityLogs, loading, error, stats, pagination } = useActivityLogs({
    page,
    pageSize,
    search: search || undefined,
    actionType: actionFilter === 'all' ? undefined : actionFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('all');
    setPage(1);
  };

  const totalActions = stats.total || 0;
  const creates = stats.byActionType.create || 0;
  const updates = stats.byActionType.update || 0;
  const deletes = stats.byActionType.delete || 0;
  const logins = stats.byActionType.login || 0;
  const logouts = stats.byActionType.logout || 0;
  const views = stats.byActionType.view || 0;
  const exports = stats.byActionType.export || 0;
  const imports = stats.byActionType.import || 0;

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground">Track all actions and events across the system</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Create</CardTitle>
              <PlusCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Update</CardTitle>
              <Pencil className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{updates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delete</CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deletes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Login</CardTitle>
              <LogIn className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logout</CardTitle>
              <LogOut className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logouts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Export</CardTitle>
              <FileDown className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Import</CardTitle>
              <FileUp className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{imports}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by entity name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  Reset Filters
                </Button>
              </div>
              
              <Tabs value={actionFilter} onValueChange={(value) => {
                setActionFilter(value);
                setPage(1);
              }}>
                <TabsList className="flex-wrap h-auto">
                  {actionTypes.map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user?.fullName || log.user?.username || 'System'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionBadgeClass(log.actionType)}>
                        {log.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{log.entityType}</TableCell>
                    <TableCell>{log.entityName || '-'}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{log.description || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(log.createdAt).toLocaleString()}
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
                            <History className="mr-2 h-4 w-4" />
                            View Entity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && activityLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Loading activity logs...
                    </TableCell>
                  </TableRow>
                )}
                {error && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive py-8">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, pagination.total)} of {pagination.total} activities
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages || loading}
                  >
                    Next
                  </Button>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    disabled={loading}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
