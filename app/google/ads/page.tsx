'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AccountStatus } from '@/lib/types';
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
import { MoveHorizontal as MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { useGoogleAdsAccounts, useGoogleAdsMutations } from '@/hooks/use-google-services';

const accountStatusColor = (status: AccountStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'inactive':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'suspended':
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

export default function GoogleAdsPage() {
  const router = useRouter();
  const { items: accounts, loading, refetch } = useGoogleAdsAccounts();
  const { deleteItem } = useGoogleAdsMutations();
  const [accountSearch, setAccountSearch] = useState('');

  const filteredAccounts = accounts.filter((a) =>
    a.accountName.toLowerCase().includes(accountSearch.toLowerCase()) ||
    a.accountEmail.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteItem(id);
      refetch();
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="min-h-screen">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
            <p className="text-sm text-muted-foreground">Manage Google Ads accounts and campaigns</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Tabs defaultValue="accounts">
            <TabsList>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-6">
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button size="sm" className="h-9 gap-2" onClick={() => router.push('/google/ads/new')}>
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Loading accounts...
                        </TableCell>
                      </TableRow>
                    ) : filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            {account.accountName}
                          </div>
                        </TableCell>
                        <TableCell>{account.accountEmail}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {account.customerId || '-'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={accountStatusColor(account.status as AccountStatus)}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{account.notes || '-'}</TableCell>
                        <TableCell>{new Date(account.createdAt).toLocaleDateString('en-US')}</TableCell>
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
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/google/ads/${account.id}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAccount(account.id)}>
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
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No accounts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    Coming Soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
