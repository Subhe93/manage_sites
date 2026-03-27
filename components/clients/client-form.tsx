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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Loader2, Plus, DollarSign, Pencil, Trash2, X, Save } from 'lucide-react';
import { useClientMutations, Client, ClientCost } from '@/hooks/use-clients';
import { toast } from 'sonner';

const clientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['active', 'suspended', 'inactive'], {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  mode: 'create' | 'edit';
}

interface LocalClientCost {
  id?: number;
  costAmount: number;
  currency: string;
  billingCycle: string;
  costType: string;
  description: string | null;
  startDate: string | null;
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

const costTypeLabels: Record<string, string> = {
  hosting: 'Hosting',
  maintenance: 'Maintenance',
  license: 'License',
  plugin: 'Plugin',
  theme: 'Theme',
  other: 'Other',
};

function CostForm({
  cost,
  onSave,
  onCancel,
  saving,
}: {
  cost?: LocalClientCost;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [costAmount, setCostAmount] = useState(cost?.costAmount?.toString() || '');
  const [currency, setCurrency] = useState(cost?.currency || 'USD');
  const [billingCycle, setBillingCycle] = useState(cost?.billingCycle || 'monthly');
  const [costType, setCostType] = useState(cost?.costType || 'other');
  const [description, setDescription] = useState(cost?.description || '');
  const [startDate, setStartDate] = useState(cost?.startDate ? cost.startDate.split('T')[0] : '');
  const [nextBillingDate, setNextBillingDate] = useState(cost?.nextBillingDate ? cost.nextBillingDate.split('T')[0] : '');
  const [autoRenew, setAutoRenew] = useState(cost?.autoRenew ?? true);
  const [paymentMethod, setPaymentMethod] = useState(cost?.paymentMethod || '');
  const [notes, setNotes] = useState(cost?.notes || '');

  const handleSubmit = () => {
    if (!costAmount || isNaN(Number(costAmount))) {
      toast.error('Please enter a valid cost amount');
      return;
    }
    onSave({
      costAmount: Number(costAmount),
      currency,
      billingCycle,
      costType,
      description: description || null,
      startDate: startDate || null,
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
          <label className="text-sm font-medium">Cost Type</label>
          <Select value={costType} onValueChange={setCostType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hosting">Hosting</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="license">License</SelectItem>
              <SelectItem value="plugin">Plugin</SelectItem>
              <SelectItem value="theme">Theme</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Next Billing Date</label>
          <Input type="date" value={nextBillingDate} onChange={(e) => setNextBillingDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Payment Method</label>
          <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="e.g. Credit Card, PayPal" />
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
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cost description..." />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notes</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
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

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const { createClient, updateClient } = useClientMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cost management
  const [costs, setCosts] = useState<LocalClientCost[]>([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [showAddCostForm, setShowAddCostForm] = useState(false);
  const [editingCostId, setEditingCostId] = useState<number | null>(null);
  const [editingCostIndex, setEditingCostIndex] = useState<number | null>(null);
  const [savingCost, setSavingCost] = useState(false);
  const [deleteCostId, setDeleteCostId] = useState<number | null>(null);
  const [deleteCostIndex, setDeleteCostIndex] = useState<number | null>(null);
  const [isDeletingCost, setIsDeletingCost] = useState(false);

  const fetchCosts = useCallback(async () => {
    if (!client?.id || mode !== 'edit') return;
    try {
      setCostsLoading(true);
      const response = await fetch(`/api/clients/${client.id}/costs`);
      const result = await response.json();
      if (response.ok) {
        setCosts(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error);
    } finally {
      setCostsLoading(false);
    }
  }, [client?.id, mode]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const handleAddCost = async (data: any) => {
    if (mode === 'create') {
      setCosts((prev) => [...prev, { ...data, id: Date.now() }]);
      setShowAddCostForm(false);
      return;
    }
    if (!client?.id) return;
    try {
      setSavingCost(true);
      const response = await fetch(`/api/clients/${client.id}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to add cost');
      }
      toast.success('Cost added successfully');
      setShowAddCostForm(false);
      fetchCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add cost');
    } finally {
      setSavingCost(false);
    }
  };

  const handleUpdateCost = async (costId: number, data: any) => {
    if (mode === 'create') {
      const idx = costs.findIndex((c) => c.id === costId);
      if (idx >= 0) {
        const updated = [...costs];
        updated[idx] = { ...data, id: costId };
        setCosts(updated);
      }
      setEditingCostId(null);
      setEditingCostIndex(null);
      return;
    }
    if (!client?.id) return;
    try {
      setSavingCost(true);
      const response = await fetch(`/api/clients/${client.id}/costs/${costId}`, {
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
    if (mode === 'create') {
      if (deleteCostIndex !== null) {
        setCosts(costs.filter((_, i) => i !== deleteCostIndex));
        setDeleteCostIndex(null);
      }
      return;
    }
    if (!deleteCostId || !client?.id) return;
    try {
      setIsDeletingCost(true);
      const response = await fetch(`/api/clients/${client.id}/costs/${deleteCostId}`, {
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
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          clientName: client.clientName,
          companyName: client.companyName || '',
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          country: client.country || '',
          status: client.status as any,
          notes: client.notes || '',
        }
      : {
          status: 'active',
        },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        companyName: data.companyName || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        country: data.country || null,
        notes: data.notes || null,
        costs: mode === 'create' && costs.length > 0 ? costs : undefined,
      };

      if (mode === 'create') {
        await createClient(submitData as any);
      } else if (client) {
        await updateClient(client.id, submitData as any);
      }

      router.push('/clients');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Client' : 'Edit Client'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="e.g., John Doe"
                {...register('clientName')}
              />
              {errors.clientName && (
                <p className="text-sm text-red-600">{errors.clientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Acme Corporation"
                {...register('companyName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., United States"
                {...register('country')}
              />
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
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address..."
              rows={3}
              {...register('address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this client..."
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
                'Create Client'
              ) : (
                'Update Client'
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

    {/* Cost Management Section */}
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Costs
          </CardTitle>
          {!showAddCostForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setShowAddCostForm(true); setEditingCostId(null); setEditingCostIndex(null); }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Cost
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddCostForm && (
          <CostForm
            onSave={handleAddCost}
            onCancel={() => setShowAddCostForm(false)}
            saving={savingCost}
          />
        )}

        {costsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : costs.length === 0 && !showAddCostForm ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No costs added yet. Click "Add Cost" to add one.
          </p>
        ) : (
          costs.map((cost, index) =>
            (mode === 'edit' && editingCostId === cost.id) ||
            (mode === 'create' && editingCostIndex === index) ? (
              <CostForm
                key={cost.id || index}
                cost={cost}
                onSave={(data) => {
                  if (mode === 'edit' && cost.id) {
                    handleUpdateCost(cost.id, data);
                  } else {
                    const updated = [...costs];
                    updated[index] = { ...data, id: cost.id };
                    setCosts(updated);
                    setEditingCostIndex(null);
                  }
                }}
                onCancel={() => { setEditingCostId(null); setEditingCostIndex(null); }}
                saving={savingCost}
              />
            ) : (
              <div
                key={cost.id || index}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.costAmount}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {billingCycleLabels[cost.billingCycle] || cost.billingCycle}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {costTypeLabels[cost.costType] || cost.costType}
                      </Badge>
                      {cost.paymentMethod && (
                        <span className="text-xs text-muted-foreground">{cost.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {cost.startDate && (
                      <p>Start: {new Date(cost.startDate).toLocaleDateString('en-US')}</p>
                    )}
                    {cost.nextBillingDate && (
                      <p>Next billing: {new Date(cost.nextBillingDate).toLocaleDateString('en-US')}</p>
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
                      if (mode === 'edit') {
                        setEditingCostId(cost.id || null);
                      } else {
                        setEditingCostIndex(index);
                      }
                      setShowAddCostForm(false);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (mode === 'edit') {
                        setDeleteCostId(cost.id || null);
                      } else {
                        setDeleteCostIndex(index);
                      }
                    }}
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

    {/* Delete Cost Confirmation */}
    <AlertDialog
      open={deleteCostId !== null || deleteCostIndex !== null}
      onOpenChange={() => { setDeleteCostId(null); setDeleteCostIndex(null); }}
    >
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
    </>
  );
}
