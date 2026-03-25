'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Calendar, Server, Loader2, DollarSign, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDomainMutations } from '@/hooks/use-domains';
import { useClients } from '@/hooks/use-clients';
import { useProviders } from '@/hooks/use-providers';
import { toast } from 'sonner';

interface DomainCost {
  id?: number;
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
}: {
  cost?: DomainCost;
  onSave: (data: any) => void;
  onCancel: () => void;
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
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSubmit}>
          <Save className="h-3.5 w-3.5 mr-1" /> {cost ? 'Update' : 'Add Cost'}
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

export default function NewDomainPage() {
  const router = useRouter();
  const { createDomain } = useDomainMutations();
  const { clients } = useClients({ pageSize: 100 });
  const { providers } = useProviders({ pageSize: 100, providerType: 'registrar' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Domain fields
  const [domainName, setDomainName] = useState('');
  const [tld, setTld] = useState('');
  const [status, setStatus] = useState('active');
  const [registrarId, setRegistrarId] = useState('');
  const [clientId, setClientId] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [renewalNotificationDays, setRenewalNotificationDays] = useState('30');
  const [whoisPrivacy, setWhoisPrivacy] = useState(true);
  const [nameservers, setNameservers] = useState('');
  const [notes, setNotes] = useState('');

  // Cost management
  const [costs, setCosts] = useState<DomainCost[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCostIndex, setEditingCostIndex] = useState<number | null>(null);

  const handleAddCost = (data: any) => {
    setCosts([...costs, data]);
    setShowAddForm(false);
  };

  const handleUpdateCost = (index: number, data: any) => {
    const updatedCosts = [...costs];
    updatedCosts[index] = data;
    setCosts(updatedCosts);
    setEditingCostIndex(null);
  };

  const handleDeleteCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createDomain({
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
        costs: costs.length > 0 ? costs : undefined,
      } as any);
      router.push('/domains');
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title="Add New Domain"
      description="Register a new domain"
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

      {/* Cost Management Section (in-memory) */}
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
                onClick={() => { setShowAddForm(true); setEditingCostIndex(null); }}
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
            />
          )}

          {/* Costs List */}
          {costs.length === 0 && !showAddForm ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No costs added yet. Click "Add Cost" to add one.
            </p>
          ) : (
            costs.map((cost, index) =>
              editingCostIndex === index ? (
                <CostForm
                  key={index}
                  cost={cost}
                  onSave={(data) => handleUpdateCost(index, data)}
                  onCancel={() => setEditingCostIndex(null)}
                />
              ) : (
                <div
                  key={index}
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
                      onClick={() => { setEditingCostIndex(index); setShowAddForm(false); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCost(index)}
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
  );
}
