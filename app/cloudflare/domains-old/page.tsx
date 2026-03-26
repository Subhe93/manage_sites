'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCloudflareDomains, useCloudflareDomainMutations, useCloudflareDomainStats } from '@/hooks/use-cloudflare-domains';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Globe, MoveHorizontal as MoreHorizontal, Search, Plus, Pencil, Trash2, Shield, CircleCheck as CheckCircle2, Lock, Loader2 } from 'lucide-react';

const sslModeColor = (mode: string) => {
  switch (mode) {
    case 'strict':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'full':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'flexible':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'off':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const cacheLevelColor = (level: string) => {
  switch (level) {
    case 'aggressive':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'basic':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'simplified':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const securityLevelColor = (level: string) => {
  switch (level) {
    case 'under_attack':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'medium':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'essentially_off':
    case 'off':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function CloudflareDomainsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: undefined as string | undefined,
    sortBy: 'createdAt' as string,
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const { domains, loading, pagination, refetch } = useCloudflareDomains(filters);
  const { stats, loading: statsLoading } = useCloudflareDomainStats();
  const { deleteDomain } = useCloudflareDomainMutations();

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteDomain(deleteId);
        refetch();
      } catch {}
      setDeleteId(null);
    }
  };

  const totalDomains = stats?.total || 0;
  const activeDomains = stats?.active || 0;
  const sslStrict = stats?.bySSLMode?.strict || 0;
  const sslFull = stats?.bySSLMode?.full || 0;
  const sslFlexibleOff = (stats?.bySSLMode?.flexible || 0) + (stats?.bySSLMode?.off || 0);

  return (
    <div className="min-h-screen">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">Cloudflare Domains</h1>
          <p className="text-sm text-muted-foreground">Manage domains connected to Cloudflare</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CF Domains</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : totalDomains}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : activeDomains}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Strict</CardTitle>
              <Lock className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : sslStrict}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Full</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : sslFull}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Flexible/Off</CardTitle>
              <Shield className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : sslFlexibleOff}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by domain name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="sm" className="h-9 gap-2" onClick={() => router.push('/cloudflare/domains/new')}>
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Zone ID</TableHead>
                <TableHead>SSL Mode</TableHead>
                <TableHead>Cache Level</TableHead>
                <TableHead>Security Level</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Activated</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No Cloudflare domains found.
                  </TableCell>
                </TableRow>
              ) : (
                domains.map((cfDomain) => (
                  <TableRow key={cfDomain.id}>
                    <TableCell className="font-medium">{cfDomain.domain?.domainName || 'Unknown'}</TableCell>
                    <TableCell>{cfDomain.cloudflareAccount?.accountName || 'Unknown'}</TableCell>
                    <TableCell>
                      {cfDomain.zoneId ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {cfDomain.zoneId}
                        </code>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={sslModeColor(cfDomain.sslMode)}>
                        {cfDomain.sslMode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cacheLevelColor(cfDomain.cacheLevel)}>
                        {cfDomain.cacheLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={securityLevelColor(cfDomain.securityLevel)}>
                        {cfDomain.securityLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cfDomain.isActive
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                        }
                      >
                        {cfDomain.isActive ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(cfDomain.activatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/cloudflare/domains/${cfDomain.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(cfDomain.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the Cloudflare domain configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
