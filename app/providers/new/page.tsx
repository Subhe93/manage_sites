'use client';

import { ProviderForm } from '@/components/providers/provider-form';

export default function NewProviderPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Service Provider</h1>
        <p className="text-gray-500 mt-1">Create a new service provider</p>
      </div>

      <ProviderForm mode="create" />
    </div>
  );
}
