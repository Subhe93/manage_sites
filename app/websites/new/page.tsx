'use client';

import { WebsiteForm } from '@/components/websites/website-form';

export default function NewWebsitePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Website</h1>
        <p className="text-gray-500 mt-1">Create a new website</p>
      </div>

      <WebsiteForm mode="create" />
    </div>
  );
}
