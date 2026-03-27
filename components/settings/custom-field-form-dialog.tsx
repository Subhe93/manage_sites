import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CustomFieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: any | null;
  onSuccess: () => void;
}

export function CustomFieldFormDialog({
  open,
  onOpenChange,
  field,
  onSuccess,
}: CustomFieldFormDialogProps) {
  const isEditing = !!field;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldOptions: '',
    isRequired: false,
    isActive: true,
    displayOrder: 1,
    defaultValue: '',
  });

  useEffect(() => {
    if (field) {
      setFormData({
        fieldName: field.fieldName || '',
        fieldLabel: field.fieldLabel || '',
        fieldType: field.fieldType || 'text',
        fieldOptions: field.fieldOptions || '',
        isRequired: field.isRequired || false,
        isActive: field.isActive !== undefined ? field.isActive : true,
        displayOrder: field.displayOrder || 1,
        defaultValue: field.defaultValue || '',
      });
    } else {
      setFormData({
        fieldName: '',
        fieldLabel: '',
        fieldType: 'text',
        fieldOptions: '',
        isRequired: false,
        isActive: true,
        displayOrder: 1,
        defaultValue: '',
      });
    }
  }, [field, open]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => {
      const data = { ...prev, [key]: value };
      // Auto-generate fieldName from fieldLabel if fieldName is untouched
      if (key === 'fieldLabel' && !isEditing && (!prev.fieldName || prev.fieldName === generateSlug(prev.fieldLabel))) {
        data.fieldName = generateSlug(value);
      }
      return data;
    });
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/settings/custom-fields/${field.id}`
        : `/api/settings/custom-fields`;
      
      const payload = {
        ...formData,
        entityType: 'website',
        displayOrder: parseInt(formData.displayOrder as any, 10) || 1
      };

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`Custom field ${isEditing ? 'updated' : 'created'} successfully.`);
        onSuccess();
      } else {
        throw new Error(data.error?.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the settings for this custom property.' 
                : 'Define a new dynamic column and filter for Websites in Master Overview.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fieldLabel">Field Label</Label>
              <Input 
                id="fieldLabel" 
                value={formData.fieldLabel} 
                onChange={e => handleChange('fieldLabel', e.target.value)} 
                placeholder="e.g. Project Manager"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fieldName">Field Key</Label>
              <div className="flex items-center">
                <span className="bg-muted text-muted-foreground px-3 py-2 rounded-l-md border border-r-0 text-sm">cf_</span>
                <Input 
                  id="fieldName" 
                  value={formData.fieldName} 
                  onChange={e => handleChange('fieldName', generateSlug(e.target.value))} 
                  placeholder="project_manager"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Unique key used in database. Only lowercase alphanumeric strings and underscores.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fieldType">Field Type</Label>
                <Select value={formData.fieldType} onValueChange={v => handleChange('fieldType', v)}>
                  <SelectTrigger id="fieldType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (String)</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select (Dropdown)</SelectItem>
                    <SelectItem value="checkbox">Checkbox (Yes/No)</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input 
                  id="displayOrder" 
                  type="number"
                  value={formData.displayOrder} 
                  onChange={e => handleChange('displayOrder', e.target.value)} 
                />
              </div>
            </div>

            {(formData.fieldType === 'select') && (
              <div className="grid gap-2">
                <Label htmlFor="fieldOptions">Options (comma separated)</Label>
                <Input 
                  id="fieldOptions" 
                  value={formData.fieldOptions} 
                  onChange={e => handleChange('fieldOptions', e.target.value)} 
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="defaultValue">Default Value (Optional)</Label>
              <Input 
                id="defaultValue" 
                value={formData.defaultValue} 
                onChange={e => handleChange('defaultValue', e.target.value)} 
                placeholder="Default value if not set"
              />
            </div>
            
            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="space-y-0.5">
                <Label>Required</Label>
                <p className="text-[12px] text-muted-foreground">Is this field mandatory when adding websites?</p>
              </div>
              <Switch checked={formData.isRequired} onCheckedChange={v => handleChange('isRequired', v)} />
            </div>

            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-[12px] text-muted-foreground">Inactive fields are hidden from overview.</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={v => handleChange('isActive', v)} />
            </div>

          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
