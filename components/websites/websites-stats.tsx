'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Activity, Wrench, Archive, Code } from 'lucide-react';
import { mockWebsites } from '@/lib/mock-data';
import type { WebsiteStatus } from '@/lib/types';

interface WebsitesStatsProps {
  activeFilter: WebsiteStatus | 'all';
  onFilterChange: (filter: WebsiteStatus | 'all') => void;
}

export function WebsitesStats({ activeFilter, onFilterChange }: WebsitesStatsProps) {
  const total = mockWebsites.length;
  const active = mockWebsites.filter((w) => w.status === 'active').length;
  const maintenance = mockWebsites.filter((w) => w.status === 'maintenance').length;
  const suspended = mockWebsites.filter((w) => w.status === 'suspended').length;
  const production = mockWebsites.filter((w) => w.environment === 'production').length;

  const cards = [
    { label: 'All Websites', value: total, icon: Monitor, filter: 'all' as const, color: 'text-primary', bg: 'bg-primary/10', clickable: true },
    { label: 'Active', value: active, icon: Activity, filter: 'active' as const, color: 'text-emerald-600', bg: 'bg-emerald-500/10', clickable: true },
    { label: 'Maintenance', value: maintenance, icon: Wrench, filter: 'maintenance' as const, color: 'text-amber-600', bg: 'bg-amber-500/10', clickable: true },
    { label: 'Suspended', value: suspended, icon: Archive, filter: 'suspended' as const, color: 'text-red-600', bg: 'bg-red-500/10', clickable: true },
    { label: 'Production', value: production, icon: Code, filter: 'all' as const, color: 'text-sky-600', bg: 'bg-sky-500/10', clickable: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = card.clickable && activeFilter === card.filter;
        return (
          <Card
            key={card.label}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => card.clickable && onFilterChange(card.filter)}
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
