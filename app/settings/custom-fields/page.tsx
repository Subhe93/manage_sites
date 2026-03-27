'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CustomFieldsTable } from '@/components/settings/custom-fields-table';
import { CustomFieldFormDialog } from '@/components/settings/custom-field-form-dialog';
import { toast } from 'sonner';

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/custom-fields?entityType=website');
      const data = await res.json();
      if (data.success) {
        setFields(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load custom fields');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleEdit = (field: any) => {
    setEditingField(field);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom field? All associated data will be lost.')) return;
    
    try {
      const res = await fetch(`/api/settings/custom-fields/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Custom field deleted successfully');
        fetchFields();
      } else {
        throw new Error(data.error?.message || 'Failed to delete');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleCreateNew = () => {
    setEditingField(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Websites Custom Fields</h1>
          <p className="text-gray-500 mt-1">Manage dynamic columns and filters for websites in Master Overview</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defined Fields</CardTitle>
          <CardDescription>
            These fields will automatically appear in the Master Overview table and filters for websites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <CustomFieldsTable 
              fields={fields} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <CustomFieldFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          field={editingField} 
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchFields();
          }} 
        />
      )}
    </div>
  );
}
