'use client';

import { useState } from 'react';
import { Globe, Calendar, Server } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProviders, mockClients } from '@/lib/mock-data';

export default function NewDomainPage() {
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
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
