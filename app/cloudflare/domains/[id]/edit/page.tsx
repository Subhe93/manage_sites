'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCloudflareDomains, mockDomains, mockCloudflareAccounts } from '@/lib/mock-data';

export default function EditCloudflareDomainPage() {
  const params = useParams();
  const id = Number(params.id);
  const cfDomain = mockCloudflareDomains.find((d) => d.id === id);

  const [domainId, setDomainId] = useState(cfDomain ? String(cfDomain.domain_id) : '');
  const [cloudflareAccountId, setCloudflareAccountId] = useState(cfDomain ? String(cfDomain.cloudflare_account_id) : '');
  const [zoneId, setZoneId] = useState(cfDomain?.zone_id ?? '');
  const [nameservers, setNameservers] = useState(cfDomain?.nameservers ?? '');
  const [sslMode, setSslMode] = useState(cfDomain?.ssl_mode ?? '');
  const [cacheLevel, setCacheLevel] = useState(cfDomain?.cache_level ?? '');
  const [securityLevel, setSecurityLevel] = useState(cfDomain?.security_level ?? '');
  const [isActive, setIsActive] = useState(cfDomain?.is_active ?? false);
  const [activatedAt, setActivatedAt] = useState(cfDomain?.activated_at ?? '');

  if (!cfDomain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Cloudflare Domain Not Found</h1>
        <Link href="/cloudflare/domains" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Cloudflare Domains
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      domain_id: domainId,
      cloudflare_account_id: cloudflareAccountId,
      zone_id: zoneId,
      nameservers,
      ssl_mode: sslMode,
      cache_level: cacheLevel,
      security_level: securityLevel,
      is_active: isActive,
      activated_at: activatedAt,
    });
  };

  const linkedDomain = mockDomains.find((d) => d.id === cfDomain.domain_id);

  return (
    <FormLayout
      title="Edit Cloudflare Domain"
      description={`Editing Cloudflare configuration for: ${linkedDomain?.domain_name ?? 'Unknown'}`}
      backHref="/cloudflare/domains"
      backLabel="Back to Cloudflare Domains"
      onSubmit={handleSubmit}
    >
      <FormSection title="Domain Configuration" icon={<Globe className="h-4 w-4" />}>
        <FormFieldWrapper label="Domain">
          <Select value={domainId} onValueChange={setDomainId}>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {mockDomains.map((domain) => (
                <SelectItem key={domain.id} value={String(domain.id)}>
                  {domain.domain_name}
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
              {mockCloudflareAccounts.map((account) => (
                <SelectItem key={account.id} value={String(account.id)}>
                  {account.account_name}
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
