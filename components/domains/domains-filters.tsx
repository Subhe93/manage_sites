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
import { useClients } from '@/hooks/use-clients';
import { useProviders } from '@/hooks/use-providers';

interface DomainsFiltersProps {
  filters: {
    status?: string;
    clientId?: number;
    registrarId?: number;
    search?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function DomainsFilters({
  filters,
  onFilterChange,
  onReset,
}: DomainsFiltersProps) {
  const { clients } = useClients({ pageSize: 100 });
  const { providers } = useProviders({ pageSize: 100, providerType: 'registrar' });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by domain name or TLD..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.clientId?.toString() || 'all'}
            onValueChange={(value) =>
              onFilterChange('clientId', value === 'all' ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.registrarId?.toString() || 'all'}
            onValueChange={(value) =>
              onFilterChange('registrarId', value === 'all' ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Registrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registrars</SelectItem>
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
