'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewClientPage() {
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
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
      title="Add New Client"
      description="Create a new client record"
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
