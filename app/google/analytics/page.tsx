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
import { ChartBar as BarChart3, CircleCheck as CheckCircle2, MoveHorizontal as MoreHorizontal, Pencil, Plus, Search, Trash2, Eye, Circle as XCircle, ArrowUpDown } from 'lucide-react';
import { mockGoogleAnalyticsAccounts } from '@/lib/mock-data';

export default function GoogleAnalyticsPage() {
  const [search, setSearch] = useState('');

  const totalAccounts = mockGoogleAnalyticsAccounts.length;
  const activeAccounts = mockGoogleAnalyticsAccounts.filter(
    (a) => a.status === 'active'
  ).length;
  const inactiveAccounts = mockGoogleAnalyticsAccounts.filter(
    (a) => a.status === 'inactive'
  ).length;
  const ga4Accounts = mockGoogleAnalyticsAccounts.filter(
    (a) => a.analytics_version === 'ga4'
  ).length;
  const uaAccounts = mockGoogleAnalyticsAccounts.filter(
    (a) => a.analytics_version === 'ua'
  ).length;

  const filteredAccounts = mockGoogleAnalyticsAccounts.filter(
    (account) =>
      account.account_name.toLowerCase().includes(search.toLowerCase()) ||
      account.account_email.toLowerCase().includes(search.toLowerCase()) ||
      account.account_id.toLowerCase().includes(search.toLowerCase()) ||
      account.measurement_id.toLowerCase().includes(search.toLowerCase())
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

  const versionColor = (version: string) => {
    switch (version) {
      case 'ga4':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'ua':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Google Analytics</h1>
            <p className="text-muted-foreground">
              Manage Google Analytics accounts and properties
            </p>
          </div>
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAccounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAccounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveAccounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GA4</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ga4Accounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Universal Analytics</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uaAccounts}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  <TableHead>Property ID</TableHead>
                  <TableHead>Measurement ID</TableHead>
                  <TableHead>Version</TableHead>
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
                    <TableCell>{account.property_id || '-'}</TableCell>
                    <TableCell>
                      {account.measurement_id ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {account.measurement_id}
                        </code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={versionColor(account.analytics_version)}>
                        {account.analytics_version === 'ga4' ? 'GA4' : 'UA'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor(account.status)}>
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
                {filteredAccounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No accounts found
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
