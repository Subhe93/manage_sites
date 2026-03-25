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
import { Card, CardContent } from '@/components/ui/card';
import { useProviders } from '@/hooks/use-providers';

interface ServersFiltersProps {
  filters: {
    serverType?: string;
    status?: string;
    providerId?: number;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function ServersFilters({
  filters,
  onFilterChange,
  onReset,
}: ServersFiltersProps) {
  const { providers } = useProviders({ pageSize: 100 });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, IP, or location..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.serverType || 'all'}
            onValueChange={(value) =>
              onFilterChange('serverType', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Server Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
              <SelectItem value="vps">VPS</SelectItem>
              <SelectItem value="dedicated">Dedicated</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFilterChange('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.providerId?.toString() || 'all'}
            onValueChange={(value) =>
              onFilterChange('providerId', value === 'all' ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id.toString()}>
                  {provider.providerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
