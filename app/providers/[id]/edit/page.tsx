'use client';

import { useParams } from 'next/navigation';
import { ProviderForm } from '@/components/providers/provider-form';
import { useProvider } from '@/hooks/use-providers';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EditProviderPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { provider, loading, error } = useProvider(id);

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

  if (error || !provider) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading provider</p>
          <p className="mt-2">{error || 'Provider not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Service Provider</h1>
        <p className="text-gray-500 mt-1">Update provider information</p>
      </div>

      <ProviderForm provider={provider} mode="edit" />
    </div>
  );
}
