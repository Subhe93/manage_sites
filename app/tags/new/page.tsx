'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tag } from 'lucide-react';

export default function NewTagPage() {
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      tag_name: tagName,
      tag_color: tagColor,
      description,
    });
  };

  return (
    <FormLayout
      title="New Tag"
      description="Create a new tag for organizing entities"
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
