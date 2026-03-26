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
import { useWebsites, useWebsiteMutations } from '@/hooks/use-websites';
import { Skeleton } from '@/components/ui/skeleton';

interface WebsitesTableProps {
  filters: any;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function WebsitesTable({ filters, onPageChange, onSortChange }: WebsitesTableProps) {
  const router = useRouter();
  const { websites, loading, pagination, refetch } = useWebsites(filters);
  const { deleteWebsite } = useWebsiteMutations();
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
      await deleteWebsite(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      wordpress: { label: 'WordPress', color: 'bg-sky-100 text-sky-700' },
      spa: { label: 'SPA', color: 'bg-teal-100 text-teal-700' },
      ecommerce: { label: 'E-commerce', color: 'bg-emerald-100 text-emerald-700' },
      custom: { label: 'Custom', color: 'bg-slate-100 text-slate-700' },
      static: { label: 'Static', color: 'bg-stone-100 text-stone-700' },
      mobile_app: { label: 'Mobile App', color: 'bg-cyan-100 text-cyan-700' },
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
      archived: { label: 'Archived', color: 'bg-gray-100 text-gray-700' },
    };

    const config = variants[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getEnvBadge = (env: string) => {
    const variants: Record<string, any> = {
      production: { label: 'Production', color: 'bg-emerald-100 text-emerald-700' },
      staging: { label: 'Staging', color: 'bg-amber-100 text-amber-700' },
      development: { label: 'Development', color: 'bg-sky-100 text-sky-700' },
    };

    const config = variants[env] || { label: env, color: 'bg-gray-100 text-gray-700' };

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
              <SortableHeader column="websiteName">Website Name</SortableHeader>
              <TableHead>Client</TableHead>
              <SortableHeader column="websiteType">Type</SortableHeader>
              <SortableHeader column="environment">Environment</SortableHeader>
              <TableHead>Server</TableHead>
              <SortableHeader column="status">Status</SortableHeader>
              <TableHead>URL</TableHead>
              <SortableHeader column="createdAt">Created At</SortableHeader>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No websites found
                </TableCell>
              </TableRow>
            ) : (
              websites.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className="font-medium">{website.websiteName}</TableCell>
                  <TableCell>
                    {website.client ? (
                      <span className="text-sm">{website.client.clientName}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getTypeBadge(website.websiteType)}</TableCell>
                  <TableCell>{getEnvBadge(website.environment)}</TableCell>
                  <TableCell>
                    {website.serverAccount?.server ? (
                      <span className="text-sm">{website.serverAccount.server.serverName}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(website.status)}</TableCell>
                  <TableCell>
                    {website.websiteUrl ? (
                      <a
                        href={website.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <span className="truncate max-w-[150px]">
                          {website.websiteUrl.replace('https://', '').replace('http://', '')}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(website.createdAt).toLocaleDateString('en-US')}
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
                          onClick={() => router.push(`/websites/${website.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(website.id)}
                          className="text-red-600"
                        >
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
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} websites
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
              This action cannot be undone. This will permanently delete the website.
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
