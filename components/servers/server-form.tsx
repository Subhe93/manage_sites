'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useServerMutations, Server } from '@/hooks/use-servers';
import { useProviders } from '@/hooks/use-providers';

const serverSchema = z.object({
  serverName: z.string().min(1, 'Server name is required'),
  providerId: z.number().int().positive().optional().nullable(),
  serverType: z.enum(['shared', 'vps', 'dedicated', 'cloud'], {
    required_error: 'Server type is required',
  }),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  operatingSystem: z.string().optional(),
  controlPanel: z.enum(['cpanel', 'plesk', 'directadmin', 'custom', 'none']).optional().nullable(),
  controlPanelUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  cpuCores: z.number().int().positive().optional().nullable(),
  ramGb: z.number().int().positive().optional().nullable(),
  storageGb: z.number().int().positive().optional().nullable(),
  bandwidthGb: z.number().int().positive().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'suspended', 'terminated'], {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
});

type ServerFormData = z.infer<typeof serverSchema>;

interface ServerFormProps {
  server?: Server;
  mode: 'create' | 'edit';
}

export function ServerForm({ server, mode }: ServerFormProps) {
  const router = useRouter();
  const { createServer, updateServer } = useServerMutations();
  const { providers } = useProviders({ pageSize: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: server
      ? {
          serverName: server.serverName,
          providerId: server.providerId,
          serverType: server.serverType as any,
          ipAddress: server.ipAddress || '',
          location: server.location || '',
          operatingSystem: server.operatingSystem || '',
          controlPanel: server.controlPanel as any,
          controlPanelUrl: server.controlPanelUrl || '',
          cpuCores: server.cpuCores,
          ramGb: server.ramGb,
          storageGb: server.storageGb,
          bandwidthGb: server.bandwidthGb,
          status: server.status as any,
          notes: server.notes || '',
        }
      : {
          status: 'active',
        },
  });

  const onSubmit = async (data: ServerFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        ipAddress: data.ipAddress || null,
        location: data.location || null,
        operatingSystem: data.operatingSystem || null,
        controlPanel: data.controlPanel || null,
        controlPanelUrl: data.controlPanelUrl || null,
        cpuCores: data.cpuCores || null,
        ramGb: data.ramGb || null,
        storageGb: data.storageGb || null,
        bandwidthGb: data.bandwidthGb || null,
        notes: data.notes || null,
      };

      if (mode === 'create') {
        await createServer(submitData);
      } else if (server) {
        await updateServer(server.id, submitData);
      }

      router.push('/servers');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Server' : 'Edit Server'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="serverName">Server Name *</Label>
              <Input
                id="serverName"
                placeholder="e.g., Production Server 1"
                {...register('serverName')}
              />
              {errors.serverName && (
                <p className="text-sm text-red-600">{errors.serverName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerId">Provider</Label>
              <Select
                value={watch('providerId')?.toString() || 'none'}
                onValueChange={(value) =>
                  setValue('providerId', value === 'none' ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Provider</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.providerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverType">Server Type *</Label>
              <Select
                value={watch('serverType')}
                onValueChange={(value) => setValue('serverType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select server type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="vps">VPS</SelectItem>
                  <SelectItem value="dedicated">Dedicated</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                </SelectContent>
              </Select>
              {errors.serverType && (
                <p className="text-sm text-red-600">{errors.serverType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                placeholder="e.g., 192.168.1.1"
                {...register('ipAddress')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                {...register('location')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingSystem">Operating System</Label>
              <Input
                id="operatingSystem"
                placeholder="e.g., Ubuntu 22.04"
                {...register('operatingSystem')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="controlPanel">Control Panel</Label>
              <Select
                value={watch('controlPanel') || 'none'}
                onValueChange={(value) =>
                  setValue('controlPanel', value === 'none' ? null : (value as any))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select control panel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="cpanel">cPanel</SelectItem>
                  <SelectItem value="plesk">Plesk</SelectItem>
                  <SelectItem value="directadmin">DirectAdmin</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="controlPanelUrl">Control Panel URL</Label>
              <Input
                id="controlPanelUrl"
                type="url"
                placeholder="https://panel.example.com"
                {...register('controlPanelUrl')}
              />
              {errors.controlPanelUrl && (
                <p className="text-sm text-red-600">{errors.controlPanelUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpuCores">CPU Cores</Label>
              <Input
                id="cpuCores"
                type="number"
                placeholder="e.g., 4"
                {...register('cpuCores', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ramGb">RAM (GB)</Label>
              <Input
                id="ramGb"
                type="number"
                placeholder="e.g., 16"
                {...register('ramGb', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageGb">Storage (GB)</Label>
              <Input
                id="storageGb"
                type="number"
                placeholder="e.g., 500"
                {...register('storageGb', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bandwidthGb">Bandwidth (GB)</Label>
              <Input
                id="bandwidthGb"
                type="number"
                placeholder="e.g., 1000"
                {...register('bandwidthGb', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this server..."
              rows={4}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Server'
              ) : (
                'Update Server'
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
