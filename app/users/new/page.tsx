'use client';

import { UserForm } from '@/components/users/user-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold">Add New User</h1>
          <p className="text-gray-500 mt-1">Create a new user account</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
