'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCloudflareAccounts } from '@/lib/mock-data';

export default function EditCloudflareAccountPage() {
  const params = useParams();
  const id = Number(params.id);
  const account = mockCloudflareAccounts.find((a) => a.id === id);

  const [accountName, setAccountName] = useState(account?.account_name ?? '');
  const [accountEmail, setAccountEmail] = useState(account?.account_email ?? '');
  const [accountId, setAccountId] = useState(account?.account_id ?? '');
  const [status, setStatus] = useState(account?.status ?? '');
  const [notes, setNotes] = useState(account?.notes ?? '');

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Cloudflare Account Not Found</h1>
        <Link href="/cloudflare/accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Cloudflare Accounts
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      account_name: accountName,
      account_email: accountEmail,
      account_id: accountId,
      status,
      notes,
    });
  };

  return (
    <FormLayout
      title="Edit Cloudflare Account"
      description={`Editing account: ${account.account_name}`}
      backHref="/cloudflare/accounts"
      backLabel="Back to Cloudflare Accounts"
      onSubmit={handleSubmit}
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
