'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProviders } from '@/lib/mock-data';

export default function EditProviderPage() {
  const params = useParams();
  const id = Number(params.id);
  const provider = mockProviders.find((p) => p.id === id);

  const [providerName, setProviderName] = useState(provider?.provider_name ?? '');
  const [providerType, setProviderType] = useState(provider?.provider_type ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(provider?.website_url ?? '');
  const [supportEmail, setSupportEmail] = useState(provider?.support_email ?? '');
  const [notes, setNotes] = useState(provider?.notes ?? '');

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Provider Not Found</h1>
        <Link href="/providers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Providers
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      provider_name: providerName,
      provider_type: providerType,
      website_url: websiteUrl,
      support_email: supportEmail,
      notes,
    });
  };

  return (
    <FormLayout
      title="Edit Provider"
      description={`Editing provider: ${provider.provider_name}`}
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
