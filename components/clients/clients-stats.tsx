'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Pause } from 'lucide-react';
import { mockClients } from '@/lib/mock-data';
import type { ClientStatus } from '@/lib/types';

interface ClientsStatsProps {
  activeFilter: ClientStatus | 'all';
  onFilterChange: (filter: ClientStatus | 'all') => void;
}

export function ClientsStats({ activeFilter, onFilterChange }: ClientsStatsProps) {
  const total = mockClients.length;
  const active = mockClients.filter((c) => c.status === 'active').length;
  const suspended = mockClients.filter((c) => c.status === 'suspended').length;
  const inactive = mockClients.filter((c) => c.status === 'inactive').length;

  const cards = [
    { label: 'All Clients', value: total, icon: Users, filter: 'all' as const, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active', value: active, icon: UserCheck, filter: 'active' as const, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Suspended', value: suspended, icon: Pause, filter: 'suspended' as const, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Inactive', value: inactive, icon: UserX, filter: 'inactive' as const, color: 'text-slate-500', bg: 'bg-slate-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filter;
        return (
          <Card
            key={card.label}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => onFilterChange(card.filter)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
