'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { mockWebsites } from '@/lib/mock-data';

export default function NewUptimeCheckPage() {
  const [websiteId, setWebsiteId] = useState('');
  const [checkUrl, setCheckUrl] = useState('');
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState('');
  const [timeoutSeconds, setTimeoutSeconds] = useState('');
  const [expectedStatusCode, setExpectedStatusCode] = useState('200');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
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
      title="New Uptime Check"
      description="Configure a new uptime monitoring check"
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
