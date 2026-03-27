'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Save, Pencil, Trash2, X, DollarSign } from 'lucide-react';
import { useServerMutations, Server } from '@/hooks/use-servers';
import { useProviders } from '@/hooks/use-providers';
import { toast } from 'sonner';

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

interface ServerCost {
  id?: number;
  serverId?: number;
  costAmount: number;
  currency: string;
  billingCycle: string;
  activationDate: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  paymentMethod: string | null;
  notes: string | null;
}

const billingCycleLabels: Record<string, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  two_years: '2 Years',
  three_years: '3 Years',
  five_years: '5 Years',
  one_time: 'One Time',
};

function CostForm({
  cost,
  onSave,
  onCancel,
  saving,
}: {
  cost?: ServerCost;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [costAmount, setCostAmount] = useState(cost?.costAmount?.toString() || '');
  const [currency, setCurrency] = useState(cost?.currency || 'USD');
  const [billingCycle, setBillingCycle] = useState(cost?.billingCycle || 'monthly');
  const [activationDate, setActivationDate] = useState(
    cost?.activationDate ? cost.activationDate.split('T')[0] : ''
  );
  const [nextBillingDate, setNextBillingDate] = useState(
    cost?.nextBillingDate ? cost.nextBillingDate.split('T')[0] : ''
  );
  const [paymentMethod, setPaymentMethod] = useState(cost?.paymentMethod || '');
  const [notes, setNotes] = useState(cost?.notes || '');
  const [autoRenew, setAutoRenew] = useState(cost?.autoRenew ?? true);

  const handleSubmit = () => {
    if (!costAmount || isNaN(Number(costAmount))) {
      toast.error('Please enter a valid cost amount');
      return;
    }

    onSave({
      costAmount: Number(costAmount),
      currency,
      billingCycle,
      activationDate: activationDate || null,
      nextBillingDate: nextBillingDate || null,
      autoRenew,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Amount <span className="text-destructive">*</span></label>
          <Input
            type="number"
            step="0.01"
            value={costAmount}
            onChange={(e) => setCostAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Currency</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Billing Cycle</label>
          <Select value={billingCycle} onValueChange={setBillingCycle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="two_years">2 Years</SelectItem>
              <SelectItem value="three_years">3 Years</SelectItem>
              <SelectItem value="five_years">5 Years</SelectItem>
              <SelectItem value="one_time">One Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Activation Date</label>
          <Input type="date" value={activationDate} onChange={(e) => setActivationDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Next Billing Date</label>
          <Input type="date" value={nextBillingDate} onChange={(e) => setNextBillingDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Payment Method</label>
          <Input
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g. Credit Card, PayPal"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Auto Renew</label>
        <Select value={autoRenew ? 'yes' : 'no'} onValueChange={(value) => setAutoRenew(value === 'yes')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
          {cost ? 'Update' : 'Add Cost'}
        </Button>
      </div>
    </div>
  );
}

export function ServerForm({ server, mode }: ServerFormProps) {
  const router = useRouter();
  const { createServer, updateServer } = useServerMutations();
  const { providers } = useProviders({ pageSize: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costs, setCosts] = useState<ServerCost[]>([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCostId, setEditingCostId] = useState<number | null>(null);
  const [savingCost, setSavingCost] = useState(false);
  const [deleteCostId, setDeleteCostId] = useState<number | null>(null);
  const [isDeletingCost, setIsDeletingCost] = useState(false);

  const fetchCosts = useCallback(async () => {
    if (!server?.id || mode !== 'edit') return;

    try {
      setCostsLoading(true);
      const response = await fetch(`/api/servers/${server.id}/costs`);
      const result = await response.json();
      if (response.ok) {
        setCosts(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error);
    } finally {
      setCostsLoading(false);
    }
  }, [server?.id, mode]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const handleAddCost = async (data: any) => {
    if (mode === 'create') {
      setCosts((prev) => [...prev, { ...data, id: Date.now() }]);
      setShowAddForm(false);
      return;
    }

    if (!server?.id) return;

    try {
      setSavingCost(true);
      const response = await fetch(`/api/servers/${server.id}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to add cost');
      }

      toast.success('Cost added successfully');
      setShowAddForm(false);
      fetchCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add cost');
    } finally {
      setSavingCost(false);
    }
  };

  const handleUpdateCost = async (costId: number, data: any) => {
    if (mode === 'create') {
      setCosts((prev) =>
        prev.map((cost) =>
          cost.id === costId
            ? { ...cost, ...data, id: cost.id }
            : cost
        )
      );
      setEditingCostId(null);
      return;
    }

    if (!server?.id) return;

    try {
      setSavingCost(true);
      const response = await fetch(`/api/servers/${server.id}/costs/${costId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to update cost');
      }

      toast.success('Cost updated successfully');
      setEditingCostId(null);
      fetchCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cost');
    } finally {
      setSavingCost(false);
    }
  };

  const handleDeleteCost = async () => {
    if (!deleteCostId) return;

    if (mode === 'create') {
      setCosts((prev) => prev.filter((cost) => cost.id !== deleteCostId));
      setDeleteCostId(null);
      return;
    }

    if (!server?.id) return;

    try {
      setIsDeletingCost(true);
      const response = await fetch(`/api/servers/${server.id}/costs/${deleteCostId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cost');
      }

      toast.success('Cost deleted successfully');
      setDeleteCostId(null);
      fetchCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cost');
    } finally {
      setIsDeletingCost(false);
    }
  };

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
        costs: costs.length > 0
          ? costs.map((cost) => ({
              costAmount: cost.costAmount,
              currency: cost.currency,
              billingCycle: cost.billingCycle,
              activationDate: cost.activationDate,
              nextBillingDate: cost.nextBillingDate,
              autoRenew: cost.autoRenew,
              paymentMethod: cost.paymentMethod,
              notes: cost.notes,
            }))
          : undefined,
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

          {(mode === 'create' || (mode === 'edit' && server)) && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Costs
                  </CardTitle>
                  {!showAddForm && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddForm(true);
                        setEditingCostId(null);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Cost
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddForm && (
                  <CostForm
                    onSave={handleAddCost}
                    onCancel={() => setShowAddForm(false)}
                    saving={savingCost}
                  />
                )}

                {costsLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading costs...</p>
                ) : costs.length === 0 && !showAddForm ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No costs added yet. Click "Add Cost" to add one.
                  </p>
                ) : (
                  costs.map((cost) =>
                    editingCostId === cost.id ? (
                      <CostForm
                        key={cost.id}
                        cost={cost}
                        onSave={(data) => handleUpdateCost(cost.id!, data)}
                        onCancel={() => setEditingCostId(null)}
                        saving={savingCost}
                      />
                    ) : (
                      <div
                        key={cost.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {cost.currency === 'USD' ? '$' : `${cost.currency} `}
                              {cost.costAmount}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-[10px]">
                                {billingCycleLabels[cost.billingCycle] || cost.billingCycle}
                              </Badge>
                              {cost.paymentMethod && (
                                <span className="text-xs text-muted-foreground">{cost.paymentMethod}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {cost.activationDate && (
                              <p>
                                Activated:{' '}
                                {new Date(cost.activationDate).toLocaleDateString('en-US')}
                              </p>
                            )}
                            {cost.nextBillingDate && (
                              <p>
                                Next billing:{' '}
                                {new Date(cost.nextBillingDate).toLocaleDateString('en-US')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingCostId(cost.id!);
                              setShowAddForm(false);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteCostId(cost.id!)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  )
                )}
              </CardContent>
            </Card>
          )}

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

        <AlertDialog open={deleteCostId !== null} onOpenChange={() => setDeleteCostId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cost?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this cost entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingCost}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCost}
                disabled={isDeletingCost}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingCost ? (
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
      </CardContent>
    </Card>
  );
}
