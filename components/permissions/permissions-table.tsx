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
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { usePermissions, usePermissionMutations } from '@/hooks/use-permissions';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionsTableProps {
  filters: any;
  onPageChange: (page: number) => void;
}

export function PermissionsTable({ filters, onPageChange }: PermissionsTableProps) {
  const router = useRouter();
  const { permissions, loading, pagination, refetch } = usePermissions(filters);
  const { deletePermission } = usePermissionMutations();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deletePermission(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPermissionLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      owner: { variant: 'destructive', label: 'Owner' },
      admin: { variant: 'default', label: 'Admin' },
      edit: { variant: 'secondary', label: 'Edit' },
      view: { variant: 'outline', label: 'View' },
    };

    const config = variants[level] || { variant: 'outline', label: level };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEntityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      client: 'bg-emerald-100 text-emerald-700',
      domain: 'bg-sky-100 text-sky-700',
      server: 'bg-amber-100 text-amber-700',
      website: 'bg-purple-100 text-purple-700',
      project: 'bg-pink-100 text-pink-700',
      all: 'bg-red-100 text-red-700',
    };

    return (
      <Badge variant="outline" className={colors[type] || 'bg-gray-100 text-gray-700'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Permission Level</TableHead>
              <TableHead>Granted By</TableHead>
              <TableHead>Granted At</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    {permission.user?.fullName || permission.user?.username || 'N/A'}
                  </TableCell>
                  <TableCell>{permission.user?.email || 'N/A'}</TableCell>
                  <TableCell>{getEntityTypeBadge(permission.entityType)}</TableCell>
                  <TableCell>{permission.entityId || 'All'}</TableCell>
                  <TableCell>{getPermissionLevelBadge(permission.permissionLevel)}</TableCell>
                  <TableCell>
                    {permission.granter?.fullName || permission.granter?.username || 'System'}
                  </TableCell>
                  <TableCell>
                    {new Date(permission.grantedAt).toLocaleDateString('en-US')}
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
                          onClick={() => router.push(`/permissions/${permission.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(permission.id)}
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
            {pagination.total} permissions
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
              This action cannot be undone. This will permanently delete the permission.
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
