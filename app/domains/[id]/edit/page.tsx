'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Globe, Calendar, Server } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDomains, mockProviders, mockClients } from '@/lib/mock-data';

export default function EditDomainPage() {
  const params = useParams();
  const id = Number(params.id);
  const domain = mockDomains.find((d) => d.id === id);

  const [domainName, setDomainName] = useState(domain?.domain_name ?? '');
  const [tld, setTld] = useState(domain?.tld ?? '');
  const [status, setStatus] = useState(domain?.status ?? '');
  const [registrarId, setRegistrarId] = useState(domain?.registrar_id ? String(domain.registrar_id) : '');
  const [clientId, setClientId] = useState(domain?.client_id ? String(domain.client_id) : '');
  const [registrationDate, setRegistrationDate] = useState(domain?.registration_date ?? '');
  const [expiryDate, setExpiryDate] = useState(domain?.expiry_date ?? '');
  const [autoRenew, setAutoRenew] = useState(domain?.auto_renew ?? false);
  const [renewalNotificationDays, setRenewalNotificationDays] = useState(domain?.renewal_notification_days ? String(domain.renewal_notification_days) : '');
  const [whoisPrivacy, setWhoisPrivacy] = useState(domain?.whois_privacy ?? false);
  const [nameservers, setNameservers] = useState(domain?.nameservers ?? '');

  if (!domain) {
    return <div className="p-6 text-center text-muted-foreground">Not Found</div>;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      domain_name: domainName,
      tld,
      status,
      registrar_id: registrarId ? Number(registrarId) : null,
      client_id: clientId ? Number(clientId) : null,
      registration_date: registrationDate,
      expiry_date: expiryDate,
      auto_renew: autoRenew,
      renewal_notification_days: renewalNotificationDays ? Number(renewalNotificationDays) : null,
      whois_privacy: whoisPrivacy,
      nameservers,
    });
  };

  return (
    <FormLayout
      title="Edit Domain"
      description={`Editing ${domain.domain_name}`}
      backHref="/domains"
      backLabel="Back to Domains"
      onSubmit={onSubmit}
    >
      <FormSection title="Domain Information" icon={<Globe className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="Domain Name" required>
          <Input value={domainName} onChange={(e) => setDomainName(e.target.value)} required />
        </FormFieldWrapper>
        <FormFieldWrapper label="TLD">
          <Input value={tld} onChange={(e) => setTld(e.target.value)} />
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
              {mockProviders.map((provider) => (
                <SelectItem key={provider.id} value={String(provider.id)}>
                  {provider.provider_name}
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
              {mockClients.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {client.client_name}
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

      <FormSection title="DNS" icon={<Server className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="Nameservers" fullWidth>
          <Textarea value={nameservers} onChange={(e) => setNameservers(e.target.value)} />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
