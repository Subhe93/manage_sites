'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { useDomains, useDomainMutations } from '@/hooks/use-domains';
import type { DomainFilters } from '@/hooks/use-domains';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  deleted: 'bg-red-800/10 text-red-800 border-red-800/20',
};

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryColor(days: number): string {
  if (days < 0) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-red-600';
  if (days <= 90) return 'text-amber-600';
  return 'text-emerald-600';
}

interface DomainsTableProps {
  filters: DomainFilters;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewDomain: (id: number) => void;
}

export function DomainsTable({ filters, onPageChange, onSortChange, onViewDomain }: DomainsTableProps) {
  const router = useRouter();
  const { domains, loading, pagination, refetch } = useDomains(filters);
  const { deleteDomain } = useDomainMutations();
  const { canEdit, canAdmin } = useUserPermissions();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSort = (column: string) => {
    const newSortOrder =
      filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newSortOrder);
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isSorted = filters.sortBy === column;
    const sortOrder = filters.sortOrder;

    return (
      <TableHead
        className="cursor-pointer select-none hover:bg-muted/50 text-xs font-medium"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteDomain(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <SortableHeader column="domainName">Domain</SortableHeader>
              <TableHead className="text-xs font-medium">Client</TableHead>
              <TableHead className="text-xs font-medium">Registrar</TableHead>
              <TableHead className="text-xs font-medium">Cloudflare</TableHead>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="expiryDate">Expiry</SortableHeader>
              <TableHead className="text-xs font-medium text-center">Days Left</TableHead>
              <TableHead className="text-xs font-medium text-center">Auto-Renew</TableHead>
              <TableHead className="text-xs font-medium text-center">WHOIS</TableHead>
              <TableHead className="text-xs font-medium text-right">Cost</TableHead>
              <TableHead className="text-xs font-medium w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  No domains found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              domains.map((domain) => {
                const daysLeft = getDaysUntilExpiry(domain.expiryDate);
                const cost = (domain as any)?.costs?.[0];

                return (
                  <TableRow
                    key={domain.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onViewDomain(domain.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{domain.domainName}</p>
                        {domain.tld && (
                          <p className="text-[11px] text-muted-foreground">{domain.tld}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.client?.clientName || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{domain.registrar?.providerName || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {domain.cloudflareAccount?.accountName || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusStyles[domain.status] || ''}`}>
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.expiryDate
                        ? new Date(domain.expiryDate).toLocaleDateString('en-US')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {daysLeft !== null ? (
                        <span className={`text-sm font-medium ${getExpiryColor(daysLeft)}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {domain.autoRenew ? (
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {domain.whoisPrivacy ? (
                        <Shield className="h-3.5 w-3.5 text-primary mx-auto" />
                      ) : (
                        <ShieldOff className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {cost ? (
                        <span className="font-medium">
                          {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.costAmount}
                          <span className="text-[10px] text-muted-foreground ml-0.5">/{cost.billingCycle === 'yearly' ? 'yr' : cost.billingCycle}</span>
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDomain(domain.id)}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {canEdit('domains') && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/domains/${domain.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          {canAdmin('domains') && (
                            <DropdownMenuItem
                              onClick={() => setDeleteId(domain.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} domains
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the domain and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
