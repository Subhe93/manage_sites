'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { mockUptimeChecks, mockWebsites } from '@/lib/mock-data';

export default function EditUptimeCheckPage() {
  const params = useParams();
  const id = Number(params.id);
  const check = mockUptimeChecks.find((c) => c.id === id);

  const [websiteId, setWebsiteId] = useState(check ? String(check.website_id) : '');
  const [checkUrl, setCheckUrl] = useState(check?.check_url ?? '');
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState(check ? String(check.check_interval_minutes) : '');
  const [timeoutSeconds, setTimeoutSeconds] = useState(check ? String(check.timeout_seconds) : '');
  const [expectedStatusCode, setExpectedStatusCode] = useState(check ? String(check.expected_status_code) : '200');
  const [isActive, setIsActive] = useState(check?.is_active ?? true);

  if (!check) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="mt-2 text-muted-foreground">Uptime check not found.</p>
        <Link href="/uptime" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to Uptime Monitor
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      website_id: Number(websiteId),
      check_url: checkUrl,
      check_interval_minutes: Number(checkIntervalMinutes),
      timeout_seconds: Number(timeoutSeconds),
      expected_status_code: Number(expectedStatusCode),
      is_active: isActive,
    });
  };

  return (
    <FormLayout
      title="Edit Uptime Check"
      description="Update uptime monitoring check configuration"
      backHref="/uptime"
      backLabel="Back to Uptime Monitor"
      onSubmit={handleSubmit}
    >
      <FormSection title="Check Configuration" icon={<Activity className="h-4 w-4" />}>
        <FormFieldWrapper label="Website" required>
          <Select value={websiteId} onValueChange={setWebsiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent>
              {mockWebsites.map((website) => (
                <SelectItem key={website.id} value={String(website.id)}>
                  {website.website_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Check URL" required>
          <Input
            type="text"
            value={checkUrl}
            onChange={(e) => setCheckUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Check Interval (minutes)" required>
          <Input
            type="number"
            value={checkIntervalMinutes}
            onChange={(e) => setCheckIntervalMinutes(e.target.value)}
            placeholder="5"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Timeout (seconds)" required>
          <Input
            type="number"
            value={timeoutSeconds}
            onChange={(e) => setTimeoutSeconds(e.target.value)}
            placeholder="30"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Expected Status Code" required>
          <Input
            type="number"
            value={expectedStatusCode}
            onChange={(e) => setExpectedStatusCode(e.target.value)}
            placeholder="200"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Active">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
