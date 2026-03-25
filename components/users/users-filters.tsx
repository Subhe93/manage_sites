'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface UsersFiltersProps {
  filters: {
    role?: string;
    isActive?: boolean;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function UsersFilters({ filters, onFilterChange, onReset }: UsersFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      {/* Search */}
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Role */}
      <div className="w-full md:w-48">
        <label className="text-sm font-medium mb-2 block">Role</label>
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => onFilterChange('role', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="w-full md:w-48">
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select
          value={
            filters.isActive === undefined
              ? 'all'
              : filters.isActive
              ? 'active'
              : 'inactive'
          }
          onValueChange={(value) =>
            onFilterChange(
              'isActive',
              value === 'all' ? undefined : value === 'active'
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={onReset}
        className="w-full md:w-auto"
      >
        <X className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
