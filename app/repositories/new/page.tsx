'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch } from 'lucide-react';
import { mockWebsites } from '@/lib/mock-data';

export default function NewRepositoryPage() {
  const [websiteId, setWebsiteId] = useState('');
  const [repositoryType, setRepositoryType] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [notes, setNotes] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      website_id: websiteId ? Number(websiteId) : null,
      repository_type: repositoryType,
      repository_url: repositoryUrl,
      repository_name: repositoryName,
      branch_name: branchName,
      is_private: isPrivate,
      notes,
    });
  };

  return (
    <FormLayout
      title="Add New Repository"
      description="Register a new code repository"
      backHref="/repositories"
      backLabel="Back to Repositories"
      onSubmit={onSubmit}
    >
      <FormSection title="Repository Details" icon={<GitBranch className="h-4 w-4" />}>
        <FormFieldWrapper label="Website">
          <Select value={websiteId} onValueChange={setWebsiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Select website" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {mockWebsites.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.website_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Repository Type" required>
          <Select value={repositoryType} onValueChange={setRepositoryType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github">github</SelectItem>
              <SelectItem value="gitlab">gitlab</SelectItem>
              <SelectItem value="bitbucket">bitbucket</SelectItem>
              <SelectItem value="other">other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Repository URL" required>
          <Input value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="https://github.com/org/repo" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Repository Name">
          <Input value={repositoryName} onChange={(e) => setRepositoryName(e.target.value)} placeholder="my-repo" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Branch Name" required>
          <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="main" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Private">
          <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
