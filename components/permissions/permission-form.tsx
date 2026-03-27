'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityType, PermissionLevel } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { usePermissionMutations, Permission } from '@/hooks/use-permissions';
import { useUsers } from '@/hooks/use-users';

const permissionSchema = z.object({
  userId: z.number().int().positive('User is required'),
  entityType: z.nativeEnum(EntityType, {
    required_error: 'Entity type is required',
  }),
  entityId: z.number().int().positive().nullable(),
  permissionLevel: z.nativeEnum(PermissionLevel, {
    required_error: 'Permission level is required',
  }),
  grantedBy: z.number().int().positive().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: Permission;
  mode: 'create' | 'edit';
}

export function PermissionForm({ permission, mode }: PermissionFormProps) {
  const router = useRouter();
  const { createPermission, updatePermission } = usePermissionMutations();
  const { users } = useUsers({ pageSize: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: permission
      ? {
          userId: permission.userId,
          entityType: permission.entityType as any,
          entityId: permission.entityId,
          permissionLevel: permission.permissionLevel as any,
          grantedBy: permission.grantedBy || undefined,
        }
      : {
          entityId: null,
        },
  });

  const entityType = watch('entityType');

  const onSubmit = async (data: PermissionFormData) => {
    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        await createPermission(data);
      } else if (permission) {
        await updatePermission(permission.id, data);
      }

      router.push('/permissions');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Permission' : 'Edit Permission'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId">User *</Label>
            <Select
              value={watch('userId')?.toString()}
              onValueChange={(value) => setValue('userId', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName || user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className="text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityType">Entity Type *</Label>
            <Select
              value={watch('entityType')}
              onValueChange={(value) => setValue('entityType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="domain">Domains</SelectItem>
                <SelectItem value="server">Servers</SelectItem>
                <SelectItem value="website">Websites</SelectItem>
                <SelectItem value="providers">Service Providers</SelectItem>
                <SelectItem value="cloudflare">Cloudflare</SelectItem>
                <SelectItem value="google">Google Services</SelectItem>
                <SelectItem value="uptime">Uptime Monitor</SelectItem>
                <SelectItem value="notifications">Notifications</SelectItem>
                <SelectItem value="activity">Activity Log</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="permissions">Permissions</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            {errors.entityType && (
              <p className="text-sm text-red-600">{errors.entityType.message}</p>
            )}
          </div>

          {entityType && entityType !== 'all' && (
            <div className="space-y-2">
              <Label htmlFor="entityId">Entity ID</Label>
              <Input
                id="entityId"
                type="number"
                placeholder="Enter entity ID (optional for all entities)"
                {...register('entityId', { valueAsNumber: true })}
              />
              {errors.entityId && (
                <p className="text-sm text-red-600">{errors.entityId.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Leave empty to grant permission to all {entityType}s
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="permissionLevel">Permission Level *</Label>
            <Select
              value={watch('permissionLevel')}
              onValueChange={(value) => setValue('permissionLevel', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View - Read only access</SelectItem>
                <SelectItem value="edit">Edit - Can modify</SelectItem>
                <SelectItem value="admin">Admin - Full management</SelectItem>
                <SelectItem value="owner">Owner - Complete control</SelectItem>
              </SelectContent>
            </Select>
            {errors.permissionLevel && (
              <p className="text-sm text-red-600">{errors.permissionLevel.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Permission'
              ) : (
                'Update Permission'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
