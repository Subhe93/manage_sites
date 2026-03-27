'use client';

import { ClientForm } from '@/components/clients/client-form';

export default function NewClientPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Client</h1>
        <p className="text-gray-500 mt-1">Create a new client</p>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}
