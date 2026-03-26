'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCloudflareDomainMutations } from '@/hooks/use-cloudflare-domains';

export default function NewCloudflareDomainPage() {
  const router = useRouter();
  const { createDomain } = useCloudflareDomainMutations();
  const [saving, setSaving] = useState(false);

  const [domainId, setDomainId] = useState('');
  const [cloudflareAccountId, setCloudflareAccountId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [nameservers, setNameservers] = useState('');
  const [sslMode, setSslMode] = useState('full');
  const [cacheLevel, setCacheLevel] = useState('basic');
  const [securityLevel, setSecurityLevel] = useState('medium');
  const [isActive, setIsActive] = useState(true);
  const [activatedAt, setActivatedAt] = useState('');

  // Fetch domains and accounts for selects
  const [domains, setDomains] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch domains
    fetch('/api/domains?pageSize=100')
      .then(res => res.json())
      .then(result => {
        if (result.data) setDomains(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {});

    // Fetch Cloudflare accounts
    fetch('/api/cloudflare/accounts?pageSize=100')
      .then(res => res.json())
      .then(result => {
        if (result.data) setAccounts(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createDomain({
        domainId: parseInt(domainId),
        cloudflareAccountId: parseInt(cloudflareAccountId),
        zoneId: zoneId || null,
        nameservers: nameservers || null,
        sslMode,
        cacheLevel,
        securityLevel,
        isActive,
        activatedAt: activatedAt || null,
      });
      router.push('/cloudflare/domains');
    } catch {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormLayout
      title="Add New Cloudflare Domain"
      description="Create a new Cloudflare domain configuration."
      backHref="/cloudflare/domains"
      backLabel="Back to Cloudflare Domains"
      onSubmit={handleSubmit}
      loading={saving}
    >
      <FormSection title="Domain Configuration" icon={<Globe className="h-4 w-4" />}>
        <FormFieldWrapper label="Domain" required>
          <Select value={domainId} onValueChange={setDomainId}>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={String(domain.id)}>
                  {domain.domainName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Cloudflare Account" required>
          <Select value={cloudflareAccountId} onValueChange={setCloudflareAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={String(account.id)}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Zone ID">
          <Input
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            placeholder="Enter Cloudflare zone ID"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Nameservers">
          <Input
            value={nameservers}
            onChange={(e) => setNameservers(e.target.value)}
            placeholder="ns1.cloudflare.com, ns2.cloudflare.com"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="SSL Mode">
          <Select value={sslMode} onValueChange={setSslMode}>
            <SelectTrigger>
              <SelectValue placeholder="Select SSL mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Cache Level">
          <Select value={cacheLevel} onValueChange={setCacheLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select cache level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aggressive">Aggressive</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="simplified">Simplified</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Security Level">
          <Select value={securityLevel} onValueChange={setSecurityLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select security level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="essentially_off">Essentially Off</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="under_attack">Under Attack</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Active">
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </FormFieldWrapper>
        <FormFieldWrapper label="Activated At">
          <Input
            type="date"
            value={activatedAt}
            onChange={(e) => setActivatedAt(e.target.value)}
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
