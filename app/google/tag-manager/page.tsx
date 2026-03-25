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
import { Box, CircleCheck as CheckCircle2, Eye, MoveHorizontal as MoreHorizontal, Pencil, Plus, Search, Tags, Trash2, Users, Circle as XCircle } from 'lucide-react';
import {
  mockGoogleTagManagerAccounts,
  mockGoogleTagManagerContainers,
  mockWebsites,
} from '@/lib/mock-data';

export default function GoogleTagManagerPage() {
  const [accountSearch, setAccountSearch] = useState('');
  const [containerSearch, setContainerSearch] = useState('');

  const totalContainers = mockGoogleTagManagerContainers.length;
  const activeContainers = mockGoogleTagManagerContainers.filter(
    (c) => c.is_active
  ).length;
  const inactiveContainers = mockGoogleTagManagerContainers.filter(
    (c) => !c.is_active
  ).length;

  const containersByType = mockGoogleTagManagerContainers.reduce(
    (acc, c) => {
      acc[c.container_type] = (acc[c.container_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredAccounts = mockGoogleTagManagerAccounts.filter(
    (account) =>
      account.account_name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      account.account_email.toLowerCase().includes(accountSearch.toLowerCase()) ||
      account.account_id.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const filteredContainers = mockGoogleTagManagerContainers.filter(
    (container) => {
      const account = mockGoogleTagManagerAccounts.find(
        (a) => a.id === container.gtm_account_id
      );
      const website = container.website_id
        ? mockWebsites.find((w) => w.id === container.website_id)
        : null;
      const searchLower = containerSearch.toLowerCase();
      return (
        container.container_name.toLowerCase().includes(searchLower) ||
        container.container_id.toLowerCase().includes(searchLower) ||
        container.container_public_id.toLowerCase().includes(searchLower) ||
        (account?.account_name.toLowerCase().includes(searchLower) ?? false) ||
        (website?.website_name.toLowerCase().includes(searchLower) ?? false)
      );
    }
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'suspended':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const containerTypeColor = (type: string) => {
    switch (type) {
      case 'web':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'server':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'amp':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'android':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'ios':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Google Tag Manager
            </h1>
            <p className="text-muted-foreground">
              Manage GTM accounts and containers
            </p>
          </div>
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts" className="gap-2">
              <Users className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="containers" className="gap-2">
              <Box className="h-4 w-4" />
              Containers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.account_name}
                        </TableCell>
                        <TableCell>{account.account_email}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {account.account_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColor(account.status)}
                          >
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {account.notes || '-'}
                        </TableCell>
                        <TableCell>{account.created_at}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
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
                    {filteredAccounts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No accounts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="containers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Containers
                  </CardTitle>
                  <Box className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalContainers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeContainers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <XCircle className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveContainers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">By Type</CardTitle>
                  <Tags className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(containersByType).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search containers..."
                  value={containerSearch}
                  onChange={(e) => setContainerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Container Name</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Container ID</TableHead>
                      <TableHead>Public ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Triggers</TableHead>
                      <TableHead>Variables</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContainers.map((container) => {
                      const account = mockGoogleTagManagerAccounts.find(
                        (a) => a.id === container.gtm_account_id
                      );
                      const website = container.website_id
                        ? mockWebsites.find(
                            (w) => w.id === container.website_id
                          )
                        : null;
                      return (
                        <TableRow key={container.id}>
                          <TableCell className="font-medium">
                            {container.container_name}
                          </TableCell>
                          <TableCell>
                            {account?.account_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            {website?.website_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                              {container.container_id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                              {container.container_public_id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={containerTypeColor(
                                container.container_type
                              )}
                            >
                              {container.container_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{container.tags_count}</TableCell>
                          <TableCell>{container.triggers_count}</TableCell>
                          <TableCell>{container.variables_count}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                container.is_active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                              }
                            >
                              {container.is_active ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>{container.created_at}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
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
                      );
                    })}
                    {filteredContainers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No containers found
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
