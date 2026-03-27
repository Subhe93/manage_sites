import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CustomFieldsTableProps {
  fields: any[];
  onEdit: (field: any) => void;
  onDelete: (id: number) => void;
}

export function CustomFieldsTable({ fields, onEdit, onDelete }: CustomFieldsTableProps) {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-md border-dashed">
        <p>No custom fields defined yet.</p>
        <p className="text-sm mt-1">Click "Add Custom Field" to create your first dynamic property.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Label</TableHead>
            <TableHead>Field Key (cf_)</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.id} className="hover:bg-muted/40 transition-colors">
              <TableCell className="font-medium">{field.fieldLabel}</TableCell>
              <TableCell className="font-mono text-sm">cf_{field.fieldName}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="uppercase text-[10px]">{field.fieldType}</Badge>
              </TableCell>
              <TableCell>{field.displayOrder}</TableCell>
              <TableCell>
                {field.isRequired ? (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Yes</Badge>
                ) : (
                  <span className="text-muted-foreground px-2">No</span>
                )}
              </TableCell>
              <TableCell>
                {field.isActive ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(field.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onEdit(field)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(field.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
