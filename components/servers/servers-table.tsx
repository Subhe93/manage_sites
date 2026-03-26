'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { useServers, useServerMutations } from '@/hooks/use-servers';
import { Skeleton } from '@/components/ui/skeleton';

interface ServersTableProps {
  filters: any;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function ServersTable({ filters, onPageChange, onSortChange }: ServersTableProps) {
  const router = useRouter();
  const { servers, loading, pagination, refetch } = useServers(filters);
  const { deleteServer } = useServerMutations();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSort = (column: string) => {
    const newSortOrder =
      filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';

    onSortChange(column, newSortOrder);
  };

  const getDaysUntilBilling = (nextBillingDate: string | null | undefined): number | null => {
    if (!nextBillingDate) return null;
    const now = new Date();
    const billing = new Date(nextBillingDate);
    return Math.ceil((billing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getBillingColor = (days: number) => {
    if (days < 0) return 'text-red-600 font-semibold';
    if (days <= 7) return 'text-red-600';
    if (days <= 30) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isSorted = filters.sortBy === column;
    const sortOrder = filters.sortOrder;

    return (
      <TableHead
        className="cursor-pointer select-none hover:bg-gray-50"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteServer(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getServerTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      shared: { label: 'Shared', color: 'bg-blue-100 text-blue-700' },
      vps: { label: 'VPS', color: 'bg-purple-100 text-purple-700' },
      dedicated: { label: 'Dedicated', color: 'bg-green-100 text-green-700' },
      cloud: { label: 'Cloud', color: 'bg-sky-100 text-sky-700' },
    };

    const config = variants[type] || { label: type, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700' },
      maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700' },
      suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
      terminated: { label: 'Terminated', color: 'bg-gray-100 text-gray-700' },
    };

    const config = variants[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="serverName">Server Name</SortableHeader>
              <SortableHeader column="serverType">Type</SortableHeader>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Resources</TableHead>
              <SortableHeader column="status">Status</SortableHeader>
              <TableHead>Control Panel</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Next Payment</TableHead>
              <TableHead className="text-center">Days Left</TableHead>
              <SortableHeader column="createdAt">Created At</SortableHeader>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  No servers found
                </TableCell>
              </TableRow>
            ) : (
              servers.map((server) => (
                <TableRow key={server.id}>
                  {(() => {
                    const cost = (server as any)?.costs?.[0];
                    const daysLeft = getDaysUntilBilling(cost?.nextBillingDate);

                    return (
                      <>
                  <TableCell className="font-medium">{server.serverName}</TableCell>
                  <TableCell>{getServerTypeBadge(server.serverType)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {server.ipAddress || '-'}
                    </code>
                  </TableCell>
                  <TableCell>{server.location || '-'}</TableCell>
                  <TableCell>
                    {server.provider ? (
                      <span className="text-sm">{server.provider.providerName}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      {server.cpuCores && <div>CPU: {server.cpuCores} cores</div>}
                      {server.ramGb && <div>RAM: {server.ramGb} GB</div>}
                      {server.storageGb && <div>Storage: {server.storageGb} GB</div>}
                      {!server.cpuCores && !server.ramGb && !server.storageGb && '-'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(server.status)}</TableCell>
                  <TableCell>
                    {server.controlPanel && server.controlPanel !== 'none' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm capitalize">{server.controlPanel}</span>
                        {server.controlPanelUrl && (
                          <a
                            href={server.controlPanelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {cost ? (
                      <span className="font-medium">
                        {cost.currency === 'USD' ? '$' : cost.currency + ' '}
                        {cost.costAmount}
                        <span className="text-[10px] text-muted-foreground ml-0.5">
                          /{cost.billingCycle === 'yearly' ? 'yr' : cost.billingCycle === 'monthly' ? 'mo' : cost.billingCycle}
                        </span>
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cost?.nextBillingDate
                      ? new Date(cost.nextBillingDate).toLocaleDateString('en-US')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {daysLeft !== null ? (
                      <span className={`text-sm font-medium ${getBillingColor(daysLeft)}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(server.createdAt).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/servers/${server.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(server.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                      </>
                    );
                  })()}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} servers
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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the server.
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
