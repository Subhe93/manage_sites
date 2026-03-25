'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch } from 'lucide-react';
import { mockRepositories, mockWebsites } from '@/lib/mock-data';

export default function EditRepositoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const repository = mockRepositories.find((r) => r.id === id);

  const [websiteId, setWebsiteId] = useState(repository ? String(repository.website_id ?? '') : '');
  const [repositoryType, setRepositoryType] = useState(repository?.repository_type ?? '');
  const [repositoryUrl, setRepositoryUrl] = useState(repository?.repository_url ?? '');
  const [repositoryName, setRepositoryName] = useState(repository?.repository_name ?? '');
  const [branchName, setBranchName] = useState(repository?.branch_name ?? '');
  const [isPrivate, setIsPrivate] = useState(repository?.is_private ?? false);
  const [notes, setNotes] = useState(repository?.notes ?? '');

  if (!repository) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Not Found</h1>
        <Link href="/repositories" className="text-primary hover:underline">
          Back to Repositories
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
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
      title="Edit Repository"
      description={`Editing repository: ${repository.repository_name}`}
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
