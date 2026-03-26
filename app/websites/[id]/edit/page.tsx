'use client';

import { useParams } from 'next/navigation';
import { WebsiteForm } from '@/components/websites/website-form';
import { useWebsite } from '@/hooks/use-websites';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EditWebsitePage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { website, loading, error } = useWebsite(id);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading website</p>
          <p className="mt-2">{error || 'Website not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Website</h1>
        <p className="text-gray-500 mt-1">Update website information</p>
      </div>

      <WebsiteForm website={website} mode="edit" />
    </div>
  );
}
