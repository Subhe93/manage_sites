'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Box, Eye, MoveHorizontal as MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useGoogleTagManagerAccounts, useGoogleTagManagerMutations } from '@/hooks/use-google-services';

export default function GoogleTagManagerPage() {
  const router = useRouter();
  const { items: accounts, loading, refetch } = useGoogleTagManagerAccounts();
  const { deleteItem } = useGoogleTagManagerMutations();
  const [accountSearch, setAccountSearch] = useState('');

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountName.toLowerCase().includes(accountSearch.toLowerCase()) ||
      account.accountEmail.toLowerCase().includes(accountSearch.toLowerCase()) ||
      (account.accountId || '').toLowerCase().includes(accountSearch.toLowerCase())
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
          <Button size="sm" className="h-9 gap-2" onClick={() => router.push('/google/tag-manager/new')}>
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
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Loading accounts...
                        </TableCell>
                      </TableRow>
                    ) : filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.accountName}
                        </TableCell>
                        <TableCell>{account.accountEmail}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {account.accountId || '-'}
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
                        <TableCell>{new Date(account.createdAt).toLocaleDateString('en-US')}</TableCell>
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
                              <DropdownMenuItem onClick={() => router.push(`/google/tag-manager/${account.id}/edit`)}>
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
            <Card>
              <CardContent className="py-16 text-center">
                <h3 className="text-lg font-semibold">Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Google Tag Manager Containers will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
