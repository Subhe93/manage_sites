'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewProviderPage() {
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      provider_name: providerName,
      provider_type: providerType,
      website_url: websiteUrl,
      support_email: supportEmail,
      notes,
    });
  };

  return (
    <FormLayout
      title="Add New Provider"
      description="Create a new service provider record."
      backHref="/providers"
      backLabel="Back to Providers"
      onSubmit={handleSubmit}
    >
      <FormSection title="Provider Information" icon={<Building2 className="h-4 w-4" />}>
        <FormFieldWrapper label="Provider Name" required>
          <Input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="Enter provider name"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Provider Type" required>
          <Select value={providerType} onValueChange={setProviderType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registrar">Registrar</SelectItem>
              <SelectItem value="hosting">Hosting</SelectItem>
              <SelectItem value="cdn">CDN</SelectItem>
              <SelectItem value="ssl">SSL</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Website URL">
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Support Email">
          <Input
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@example.com"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this provider"
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
