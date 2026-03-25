'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Loader2 } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCloudflareDomain, useCloudflareDomainMutations } from '@/hooks/use-cloudflare-domains';

export default function EditCloudflareDomainPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { domain: cfDomain, loading: fetchLoading, error } = useCloudflareDomain(id);
  const { updateDomain } = useCloudflareDomainMutations();
  const [saving, setSaving] = useState(false);

  const [domainId, setDomainId] = useState('');
  const [cloudflareAccountId, setCloudflareAccountId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [nameservers, setNameservers] = useState('');
  const [sslMode, setSslMode] = useState('');
  const [cacheLevel, setCacheLevel] = useState('');
  const [securityLevel, setSecurityLevel] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [activatedAt, setActivatedAt] = useState('');

  // Fetch domains and accounts for selects
  const [allDomains, setAllDomains] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/domains?pageSize=100')
      .then(res => res.json())
      .then(result => {
        if (result.data) setAllDomains(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {});

    fetch('/api/cloudflare/accounts?pageSize=100')
      .then(res => res.json())
      .then(result => {
        if (result.data) setAccounts(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (cfDomain) {
      setDomainId(String(cfDomain.domainId));
      setCloudflareAccountId(String(cfDomain.cloudflareAccountId));
      setZoneId(cfDomain.zoneId || '');
      setNameservers(cfDomain.nameservers || '');
      setSslMode(cfDomain.sslMode || '');
      setCacheLevel(cfDomain.cacheLevel || '');
      setSecurityLevel(cfDomain.securityLevel || '');
      setIsActive(cfDomain.isActive);
      setActivatedAt(cfDomain.activatedAt ? new Date(cfDomain.activatedAt).toISOString().split('T')[0] : '');
    }
  }, [cfDomain]);

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !cfDomain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Cloudflare Domain Not Found</h1>
        <Link href="/cloudflare/domains" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Cloudflare Domains
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateDomain(id, {
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
      title="Edit Cloudflare Domain"
      description={`Editing Cloudflare configuration for: ${cfDomain.domain?.domainName ?? 'Unknown'}`}
      backHref="/cloudflare/domains"
      backLabel="Back to Cloudflare Domains"
      onSubmit={handleSubmit}
      loading={saving}
    >
      <FormSection title="Domain Configuration" icon={<Globe className="h-4 w-4" />}>
        <FormFieldWrapper label="Domain">
          <Select value={domainId} onValueChange={setDomainId}>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {allDomains.map((domain) => (
                <SelectItem key={domain.id} value={String(domain.id)}>
                  {domain.domainName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Cloudflare Account">
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
