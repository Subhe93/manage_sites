'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCloudflareAccountMutations } from '@/hooks/use-cloudflare-accounts';

export default function NewCloudflareAccountPage() {
  const router = useRouter();
  const { createAccount } = useCloudflareAccountMutations();
  const [loading, setLoading] = useState(false);

  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createAccount({
        accountName,
        accountEmail,
        accountId: accountId || null,
        status,
        notes: notes || null,
      } as any);
      router.push('/cloudflare/accounts');
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Add New Cloudflare Account"
      description="Create a new Cloudflare account record."
      backHref="/cloudflare/accounts"
      backLabel="Back to Cloudflare Accounts"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <FormSection title="Account Details" icon={<Cloud className="h-4 w-4" />}>
        <FormFieldWrapper label="Account Name" required>
          <Input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Enter account name"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Account Email" required>
          <Input
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Account ID">
          <Input
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Enter Cloudflare account ID"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this account"
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
