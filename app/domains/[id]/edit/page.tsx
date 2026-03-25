'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Globe, Calendar, Server, DollarSign, Plus, Pencil, Trash2, Loader2, Save, X } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useDomain, useDomainMutations } from '@/hooks/use-domains';
import { useClients } from '@/hooks/use-clients';
import { useProviders } from '@/hooks/use-providers';
import { toast } from 'sonner';

interface DomainCost {
  id: number;
  domainId: number;
  costAmount: number;
  currency: string;
  billingCycle: string;
  purchaseDate: string | null;
  nextBillingDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

function CostForm({
  cost,
  onSave,
  onCancel,
  saving,
}: {
  cost?: DomainCost;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [costAmount, setCostAmount] = useState(cost?.costAmount?.toString() || '');
  const [currency, setCurrency] = useState(cost?.currency || 'USD');
  const [billingCycle, setBillingCycle] = useState(cost?.billingCycle || 'yearly');
  const [purchaseDate, setPurchaseDate] = useState(cost?.purchaseDate ? cost.purchaseDate.split('T')[0] : '');
  const [nextBillingDate, setNextBillingDate] = useState(cost?.nextBillingDate ? cost.nextBillingDate.split('T')[0] : '');
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
      purchaseDate: purchaseDate || null,
      nextBillingDate: nextBillingDate || null,
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
          <label className="text-sm font-medium">Purchase Date</label>
          <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Next Billing Date</label>
          <Input type="date" value={nextBillingDate} onChange={(e) => setNextBillingDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Payment Method</label>
          <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="e.g. Credit Card, PayPal" />
        </div>
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

const billingCycleLabels: Record<string, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  two_years: '2 Years',
  three_years: '3 Years',
  five_years: '5 Years',
  one_time: 'One Time',
};

export default function EditDomainPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { domain, loading } = useDomain(id);
  const { updateDomain } = useDomainMutations();
  const { clients } = useClients({ pageSize: 100 });
  const { providers } = useProviders({ pageSize: 100, providerType: 'registrar' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Domain fields
  const [domainName, setDomainName] = useState('');
  const [tld, setTld] = useState('');
  const [status, setStatus] = useState('');
  const [registrarId, setRegistrarId] = useState('');
  const [clientId, setClientId] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [renewalNotificationDays, setRenewalNotificationDays] = useState('');
  const [whoisPrivacy, setWhoisPrivacy] = useState(false);
  const [nameservers, setNameservers] = useState('');
  const [notes, setNotes] = useState('');

  // Cost management
  const [costs, setCosts] = useState<DomainCost[]>([]);
  const [costsLoading, setCostsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCostId, setEditingCostId] = useState<number | null>(null);
  const [savingCost, setSavingCost] = useState(false);
  const [deleteCostId, setDeleteCostId] = useState<number | null>(null);
  const [isDeletingCost, setIsDeletingCost] = useState(false);

  // Fetch costs
  const fetchCosts = useCallback(async () => {
    try {
      setCostsLoading(true);
      const response = await fetch(`/api/domains/${id}/costs`);
      const result = await response.json();
      if (response.ok) {
        setCosts(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error);
    } finally {
      setCostsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (domain) {
      setDomainName(domain.domainName || '');
      setTld(domain.tld || '');
      setStatus(domain.status || '');
      setRegistrarId(domain.registrarId ? String(domain.registrarId) : '');
      setClientId(domain.clientId ? String(domain.clientId) : '');
      setRegistrationDate(domain.registrationDate ? domain.registrationDate.split('T')[0] : '');
      setExpiryDate(domain.expiryDate ? domain.expiryDate.split('T')[0] : '');
      setAutoRenew(domain.autoRenew || false);
      setRenewalNotificationDays(domain.renewalNotificationDays ? String(domain.renewalNotificationDays) : '30');
      setWhoisPrivacy(domain.whoisPrivacy || false);
      setNameservers(domain.nameservers || '');
      setNotes(domain.notes || '');
    }
  }, [domain]);

  useEffect(() => {
    if (id) {
      fetchCosts();
    }
  }, [id, fetchCosts]);

  const handleAddCost = async (data: any) => {
    try {
      setSavingCost(true);
      const response = await fetch(`/api/domains/${id}/costs`, {
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
    try {
      setSavingCost(true);
      const response = await fetch(`/api/domains/${id}/costs/${costId}`, {
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
    try {
      setIsDeletingCost(true);
      const response = await fetch(`/api/domains/${id}/costs/${deleteCostId}`, {
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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!domain) {
    return <div className="p-6 text-center text-muted-foreground">Domain not found</div>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateDomain(id, {
        domainName,
        tld: tld || null,
        status,
        registrarId: registrarId ? Number(registrarId) : null,
        clientId: clientId ? Number(clientId) : null,
        registrationDate: registrationDate || null,
        expiryDate: expiryDate || null,
        autoRenew,
        renewalNotificationDays: renewalNotificationDays ? Number(renewalNotificationDays) : 30,
        whoisPrivacy,
        nameservers: nameservers || null,
        notes: notes || null,
      } as any);
      router.push('/domains');
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormLayout
        title="Edit Domain"
        description={`Editing ${domain.domainName}`}
        backHref="/domains"
        backLabel="Back to Domains"
        onSubmit={onSubmit}
      >
        <FormSection title="Domain Information" icon={<Globe className="h-4 w-4 text-primary" />}>
          <FormFieldWrapper label="Domain Name" required>
            <Input value={domainName} onChange={(e) => setDomainName(e.target.value)} required />
          </FormFieldWrapper>
          <FormFieldWrapper label="TLD">
            <Input value={tld} onChange={(e) => setTld(e.target.value)} placeholder=".com, .net, .org" />
          </FormFieldWrapper>
          <FormFieldWrapper label="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
          <FormFieldWrapper label="Registrar">
            <Select value={registrarId} onValueChange={setRegistrarId}>
              <SelectTrigger>
                <SelectValue placeholder="Select registrar" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={String(provider.id)}>
                    {provider.providerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
          <FormFieldWrapper label="Client">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </FormSection>

        <FormSection title="Registration" icon={<Calendar className="h-4 w-4 text-primary" />}>
          <FormFieldWrapper label="Registration Date">
            <Input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Expiry Date">
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Auto Renew">
            <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Renewal Notification Days">
            <Input type="number" value={renewalNotificationDays} onChange={(e) => setRenewalNotificationDays(e.target.value)} />
          </FormFieldWrapper>
          <FormFieldWrapper label="WHOIS Privacy">
            <Switch checked={whoisPrivacy} onCheckedChange={setWhoisPrivacy} />
          </FormFieldWrapper>
        </FormSection>

        <FormSection title="DNS & Notes" icon={<Server className="h-4 w-4 text-primary" />}>
          <FormFieldWrapper label="Nameservers" fullWidth>
            <Textarea value={nameservers} onChange={(e) => setNameservers(e.target.value)} placeholder="ns1.example.com, ns2.example.com" />
          </FormFieldWrapper>
          <FormFieldWrapper label="Notes" fullWidth>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes about this domain..." />
          </FormFieldWrapper>
        </FormSection>

        {/* Cost Management Section */}
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
                  onClick={() => { setShowAddForm(true); setEditingCostId(null); }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Cost
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Form */}
            {showAddForm && (
              <CostForm
                onSave={handleAddCost}
                onCancel={() => setShowAddForm(false)}
                saving={savingCost}
              />
            )}

            {/* Costs List */}
            {costsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
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
                    onSave={(data) => handleUpdateCost(cost.id, data)}
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
                          {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.costAmount}
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
                        {cost.purchaseDate && (
                          <p>Purchased: {new Date(cost.purchaseDate).toLocaleDateString('en-US')}</p>
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
                        onClick={() => { setEditingCostId(cost.id); setShowAddForm(false); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCostId(cost.id)}
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
      </FormLayout>

      {/* Delete Cost Confirmation */}
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
    </>
  );
}
