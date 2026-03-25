'use client';

import { ServerForm } from '@/components/servers/server-form';

export default function NewServerPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Server</h1>
        <p className="text-gray-500 mt-1">Create a new server</p>
      </div>

      <ServerForm mode="create" />
    </div>
  );
}
