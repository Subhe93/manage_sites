'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClients } from '@/lib/mock-data';

export default function EditClientPage() {
  const params = useParams();
  const id = Number(params.id);
  const client = mockClients.find((c) => c.id === id);

  const [clientName, setClientName] = useState(client?.client_name ?? '');
  const [companyName, setCompanyName] = useState(client?.company_name ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [country, setCountry] = useState(client?.country ?? '');
  const [status, setStatus] = useState(client?.status ?? '');
  const [notes, setNotes] = useState(client?.notes ?? '');

  if (!client) {
    return <div className="p-6 text-center text-muted-foreground">Not Found</div>;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      client_name: clientName,
      company_name: companyName,
      email,
      phone,
      country,
      status,
      notes,
    });
  };

  return (
    <FormLayout
      title="Edit Client"
      description={`Editing ${client.client_name}`}
      backHref="/clients"
      backLabel="Back to Clients"
      onSubmit={onSubmit}
    >
      <FormSection title="Client Information" icon={<Users className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="Client Name" required>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        </FormFieldWrapper>
        <FormFieldWrapper label="Company Name">
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Country">
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Status" required>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
