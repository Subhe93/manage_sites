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

interface WebsitesFiltersProps {
  filters: {
    type?: string;
    status?: string;
    environment?: string;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function WebsitesFilters({
  filters,
  onFilterChange,
  onReset,
}: WebsitesFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, URL, or description..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value || undefined)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              onFilterChange('type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Website Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="wordpress">WordPress</SelectItem>
              <SelectItem value="spa">SPA</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="mobile_app">Mobile App</SelectItem>
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
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.environment || 'all'}
            onValueChange={(value) =>
              onFilterChange('environment', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
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
