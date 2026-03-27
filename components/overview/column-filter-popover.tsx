'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type FilterOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty' | 'in';
export type ColumnFilterType = 'text' | 'select' | 'boolean' | 'multiSelect';

export interface ColumnFilterConfig {
  type: ColumnFilterType;
  options?: { value: string; label: string }[];
  /** Key used to fetch dynamic options from filter-options API (e.g. 'serverProvider') */
  optionsKey?: string;
}

export interface ActiveFilter {
  field: string;
  operator: FilterOperator;
  value: string | string[];
}

interface ColumnFilterPopoverProps {
  columnId: string;
  columnLabel: string;
  filterConfig: ColumnFilterConfig;
  activeFilter?: ActiveFilter;
  onApply: (filter: ActiveFilter | null) => void;
  /** Dynamic options from DB for multiSelect columns */
  dynamicOptions?: string[];
}

const TEXT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

export function ColumnFilterPopover({
  columnId,
  columnLabel,
  filterConfig,
  activeFilter,
  onApply,
  dynamicOptions,
}: ColumnFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [operator, setOperator] = useState<FilterOperator>(activeFilter?.operator || (filterConfig.type === 'multiSelect' ? 'in' : 'contains'));
  const [value, setValue] = useState(activeFilter?.value || '');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    activeFilter?.operator === 'in' && Array.isArray(activeFilter.value)
      ? activeFilter.value
      : activeFilter?.operator === 'in' && typeof activeFilter?.value === 'string' && activeFilter.value
        ? activeFilter.value.split(',')
        : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = !!activeFilter;
  const needsValue = operator !== 'isEmpty' && operator !== 'isNotEmpty';

  // Merge static options with dynamic DB options for multiSelect
  const allOptions = useMemo(() => {
    if (filterConfig.type === 'multiSelect') {
      if (dynamicOptions && dynamicOptions.length > 0) {
        return dynamicOptions.map((v) => ({ value: v, label: v }));
      }
      return filterConfig.options || [];
    }
    return filterConfig.options || [];
  }, [filterConfig, dynamicOptions]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return allOptions;
    return allOptions.filter((o) =>
      o.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allOptions, searchQuery]);

  const handleApply = () => {
    if (filterConfig.type === 'multiSelect' || filterConfig.type === 'select') {
      if (selectedValues.length > 0) {
        onApply({ field: columnId, operator: 'in', value: selectedValues });
        setOpen(false);
      }
    } else if (!needsValue || (typeof value === 'string' && value.trim())) {
      onApply({ field: columnId, operator, value: needsValue ? (value as string).trim() : '' });
      setOpen(false);
    }
  };

  const handleClear = () => {
    onApply(null);
    setOperator(filterConfig.type === 'multiSelect' ? 'in' : 'contains');
    setValue('');
    setSelectedValues([]);
    setSearchQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
  };

  const toggleOption = (optionValue: string) => {
    setSelectedValues((prev) =>
      prev.includes(optionValue)
        ? prev.filter((v) => v !== optionValue)
        : [...prev, optionValue]
    );
  };

  const selectAll = () => {
    setSelectedValues(filteredOptions.map((o) => o.value));
  };

  const deselectAll = () => {
    setSelectedValues([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
            isActive
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground/40 hover:text-muted-foreground'
          }`}
          title={`Filter ${columnLabel}`}
        >
          <Filter className="h-3 w-3" />
          {isActive && filterConfig.type === 'multiSelect' && Array.isArray(activeFilter?.value) && (
            <span className="text-[9px] font-bold ml-0.5">{activeFilter.value.length}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-3 space-y-3" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filter: {columnLabel}
          </span>
          {isActive && (
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-destructive" onClick={handleClear}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* TEXT filter */}
        {filterConfig.type === 'text' && (
          <>
            <Select value={operator} onValueChange={(v) => setOperator(v as FilterOperator)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEXT_OPERATORS.map((op) => (
                  <SelectItem key={op.value} value={op.value} className="text-xs">
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {needsValue && (
              <Input
                className="h-8 text-xs"
                placeholder="Filter value..."
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            )}
          </>
        )}

        {/* MULTI-SELECT filter (with checkboxes + search) */}
        {(filterConfig.type === 'multiSelect' || filterConfig.type === 'select') && (
          <div className="space-y-2">
            {allOptions.length > 5 && (
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-7 text-xs pl-7"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {selectedValues.length} of {allOptions.length} selected
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={selectAll}>
                  All
                </Button>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={deselectAll}>
                  None
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-0.5">
                {filteredOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No options found</p>
                ) : (
                  filteredOptions.map((opt) => {
                    const checked = selectedValues.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs hover:bg-muted/60 transition-colors ${
                          checked ? 'bg-primary/5 font-medium' : ''
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleOption(opt.value)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="truncate">{opt.label}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* BOOLEAN filter */}
        {filterConfig.type === 'boolean' && (
          <Select value={(value as string) || 'true'} onValueChange={(v) => setValue(v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true" className="text-xs">Yes</SelectItem>
              <SelectItem value="false" className="text-xs">No</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button
          size="sm"
          className="w-full h-7 text-xs"
          onClick={handleApply}
          disabled={
            (filterConfig.type === 'multiSelect' || filterConfig.type === 'select') && selectedValues.length === 0
          }
        >
          Apply Filter
          {(filterConfig.type === 'multiSelect' || filterConfig.type === 'select') && selectedValues.length > 0 && (
            <span className="ml-1">({selectedValues.length})</span>
          )}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function ActiveFiltersBar({
  filters,
  columnLabels,
  onRemove,
  onClearAll,
}: {
  filters: ActiveFilter[];
  columnLabels: Record<string, string>;
  onRemove: (field: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;

  const formatValue = (f: ActiveFilter) => {
    if (f.operator === 'in' && Array.isArray(f.value)) {
      if (f.value.length <= 2) return f.value.join(', ');
      return `${f.value[0]}, ${f.value[1]} +${f.value.length - 2}`;
    }
    if (f.operator === 'isEmpty') return 'empty';
    if (f.operator === 'isNotEmpty') return 'not empty';
    return typeof f.value === 'string' ? `"${f.value}"` : String(f.value);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
      {filters.map((f) => (
        <Badge
          key={f.field}
          variant="secondary"
          className="gap-1 text-xs pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onRemove(f.field)}
        >
          <span className="font-semibold">{columnLabels[f.field] || f.field}</span>
          {f.operator !== 'in' && <span className="opacity-60">{f.operator}</span>}
          <span>{formatValue(f)}</span>
          <X className="h-3 w-3 ml-0.5" />
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive px-2" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
