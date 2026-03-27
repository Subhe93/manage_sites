'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface PermissionsFiltersProps {
  filters: {
    permissionLevel?: string;
    entityType?: string;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function PermissionsFilters({
  filters,
  onFilterChange,
  onReset,
}: PermissionsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user name or email..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value || undefined)}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.permissionLevel || 'all'}
        onValueChange={(value) =>
          onFilterChange('permissionLevel', value === 'all' ? undefined : value)
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Permission Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="edit">Edit</SelectItem>
          <SelectItem value="view">View</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.entityType || 'all'}
        onValueChange={(value) =>
          onFilterChange('entityType', value === 'all' ? undefined : value)
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Entity Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="client">Clients</SelectItem>
          <SelectItem value="domain">Domains</SelectItem>
          <SelectItem value="server">Servers</SelectItem>
          <SelectItem value="website">Websites</SelectItem>
          <SelectItem value="providers">Service Providers</SelectItem>
          <SelectItem value="cloudflare">Cloudflare</SelectItem>
          <SelectItem value="google">Google Services</SelectItem>
          <SelectItem value="uptime">Uptime Monitor</SelectItem>
          <SelectItem value="notifications">Notifications</SelectItem>
          <SelectItem value="activity">Activity Log</SelectItem>
          <SelectItem value="users">Users</SelectItem>
          <SelectItem value="permissions">Permissions</SelectItem>
          <SelectItem value="settings">Settings</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>
        <X className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
