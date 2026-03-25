'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cloud, Loader2 } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCloudflareAccount, useCloudflareAccountMutations } from '@/hooks/use-cloudflare-accounts';

export default function EditCloudflareAccountPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { account, loading: fetchLoading, error } = useCloudflareAccount(id);
  const { updateAccount } = useCloudflareAccountMutations();
  const [saving, setSaving] = useState(false);

  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (account) {
      setAccountName(account.accountName || '');
      setAccountEmail(account.accountEmail || '');
      setAccountId(account.accountId || '');
      setStatus(account.status || '');
      setNotes(account.notes || '');
    }
  }, [account]);

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Cloudflare Account Not Found</h1>
        <Link href="/cloudflare/accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Cloudflare Accounts
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAccount(id, {
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
      setSaving(false);
    }
  };

  return (
    <FormLayout
      title="Edit Cloudflare Account"
      description={`Editing account: ${account.accountName}`}
      backHref="/cloudflare/accounts"
      backLabel="Back to Cloudflare Accounts"
      onSubmit={handleSubmit}
      loading={saving}
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