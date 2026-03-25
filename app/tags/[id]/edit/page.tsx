'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tag } from 'lucide-react';
import { mockTags } from '@/lib/mock-data';

export default function EditTagPage() {
  const params = useParams();
  const id = Number(params.id);
  const tag = mockTags.find((t) => t.id === id);

  const [tagName, setTagName] = useState(tag?.tag_name ?? '');
  const [tagColor, setTagColor] = useState(tag?.tag_color ?? '#3b82f6');
  const [description, setDescription] = useState(tag?.description ?? '');

  if (!tag) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="mt-2 text-muted-foreground">Tag not found.</p>
        <Link href="/tags" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to Tags
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      tag_name: tagName,
      tag_color: tagColor,
      description,
    });
  };

  return (
    <FormLayout
      title="Edit Tag"
      description="Update tag details"
      backHref="/tags"
      backLabel="Back to Tags"
      onSubmit={handleSubmit}
    >
      <FormSection title="Tag Details" icon={<Tag className="h-4 w-4" />}>
        <FormFieldWrapper label="Tag Name" required>
          <Input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Tag name"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Tag Color">
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <div
              className="h-8 w-8 rounded-full border"
              style={{ backgroundColor: tagColor }}
            />
            <span className="text-sm text-muted-foreground">{tagColor}</span>
          </div>
        </FormFieldWrapper>
        <FormFieldWrapper label="Description" fullWidth>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tag description"
            rows={3}
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
