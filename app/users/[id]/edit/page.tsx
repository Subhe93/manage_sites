'use client';

import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/users/user-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-users';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = parseInt(params.id);
  const { user, loading, error } = useUser(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">An error occurred</p>
          <p className="mt-2 text-gray-600">{error || 'User not found'}</p>
          <Button onClick={() => router.push('/users')} className="mt-4">
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-gray-500 mt-1">Edit {user.fullName || user.username} information</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <UserForm user={user} mode="edit" />
      </div>
    </div>
  );
}
