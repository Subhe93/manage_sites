'use client';

import { useParams } from 'next/navigation';
import { ClientForm } from '@/components/clients/client-form';
import { useClient } from '@/hooks/use-clients';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EditClientPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { client, loading, error } = useClient(id);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading client</p>
          <p className="mt-2">{error || 'Client not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Client</h1>
        <p className="text-gray-500 mt-1">Update client information</p>
      </div>

      <ClientForm client={client} mode="edit" />
    </div>
  );
}
