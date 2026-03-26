'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Filter, Columns } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface OverviewFiltersProps {
  onApply: (filters: any[]) => void;
  availableColumns: { id: string; label: string }[];
  visibleColumns: string[];
  onColumnToggle: (columns: string[]) => void;
  currentFilters: any[];
}

const FILTER_FIELDS = [
  { id: 'domainName', label: 'Domain Name' },
  { id: 'status', label: 'Status' },
  { id: 'clientName', label: 'Client Name' },
  { id: 'cloudflareAccount', label: 'Cloudflare Account' },
  { id: 'hasWebsite', label: 'Has Website' },
];

const OPERATORS = [
  { id: 'equals', label: 'Equals' },
  { id: 'contains', label: 'Contains' },
  { id: 'startsWith', label: 'Starts With' },
  { id: 'endsWith', label: 'Ends With' },
];

export function OverviewFiltersComponent({
  onApply,
  availableColumns,
  visibleColumns,
  onColumnToggle,
  currentFilters,
}: OverviewFiltersProps) {
  const [filters, setFilters] = useState<any[]>(currentFilters || []);

  const addFilter = () => {
    setFilters([...filters, { field: 'domainName', operator: 'contains', value: '' }]);
  };

  const updateFilter = (index: number, key: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    
    // Auto adjust operator for boolean-like fields
    if (key === 'field' && value === 'hasWebsite') {
      newFilters[index].operator = 'equals';
      newFilters[index].value = 'true';
    }
    
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    onApply(filters.filter(f => f.value !== '' || f.field === 'hasWebsite'));
  };

  const toggleColumn = (colId: string) => {
    if (visibleColumns.includes(colId)) {
      onColumnToggle(visibleColumns.filter(id => id !== colId));
    } else {
      onColumnToggle([...visibleColumns, colId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Columns className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableColumns.map(col => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={visibleColumns.includes(col.id)}
                onCheckedChange={() => toggleColumn(col.id)}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {filters.map((f, i) => (
          <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-muted/20 p-2 rounded-md border">
            <Select value={f.field} onValueChange={(val) => updateFilter(i, 'field', val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_FIELDS.map(field => (
                  <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {f.field === 'hasWebsite' ? (
              <Select value={String(f.value)} onValueChange={(val) => updateFilter(i, 'value', val)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            ) : f.field === 'status' ? (
              <>
                <Select value={f.operator} onValueChange={(val) => updateFilter(i, 'operator', val)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={f.value} onValueChange={(val) => updateFilter(i, 'value', val)}>
                  <SelectTrigger className="flex-1 min-w-[150px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select value={f.operator} onValueChange={(val) => updateFilter(i, 'operator', val)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op.id} value={op.id}>{op.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1 min-w-[150px]"
                  placeholder="Value..."
                  value={f.value}
                  onChange={(e) => updateFilter(i, 'value', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
              </>
            )}

            <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={addFilter} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Condition
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
