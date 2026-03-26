'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Bookmark } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface SavedFiltersDropdownProps {
  savedFilters: any[];
  onApply: (filter: any) => void;
  onSave: (name: string, isDefault: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function SavedFiltersDropdown({
  savedFilters,
  onApply,
  onSave,
  onDelete
}: SavedFiltersDropdownProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSelect = (val: string) => {
    setSelectedId(val);
    const filter = savedFilters.find(f => String(f.id) === val);
    if (filter) {
      onApply(filter);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    
    setIsSaving(true);
    await onSave(newFilterName, isDefault);
    setIsSaving(false);
    setNewFilterName('');
    setIsDefault(false);
    setPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2 bg-background border rounded-md px-2 py-1.5 shadow-sm">
      <Bookmark className="h-4 w-4 text-muted-foreground ml-1" />
      <Select value={selectedId} onValueChange={handleSelect}>
        <SelectTrigger className="w-[200px] h-8 border-0 shadow-none focus:ring-0 bg-transparent">
          <SelectValue placeholder="Saved views..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default" disabled className="text-muted-foreground italic">
            Select a saved view
          </SelectItem>
          {savedFilters.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              <div className="flex items-center justify-between w-full min-w-[150px]">
                <span>{f.name} {f.isDefault && '(Default)'}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedId && selectedId !== 'default' && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-destructive hover:bg-destructive/10"
          onClick={() => {
            onDelete(Number(selectedId));
            setSelectedId('');
          }}
          title="Delete selected view"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <div className="h-4 w-px bg-border mx-1" />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save View</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[280px]">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm leading-none">Save Current View</h4>
              <p className="text-xs text-muted-foreground">
                Saves your current columns and filters for quick access later.
              </p>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="View name (e.g. SEO Focus)"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="default-view" 
                checked={isDefault}
                onCheckedChange={(c) => setIsDefault(!!c)}
              />
              <label htmlFor="default-view" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as my default view
              </label>
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={isSaving || !newFilterName.trim()}>
              {isSaving ? 'Saving...' : 'Save View'}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
