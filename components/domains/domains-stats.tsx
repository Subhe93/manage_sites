'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Globe, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock, Circle as XCircle } from 'lucide-react';
import { mockDomains } from '@/lib/mock-data';
import type { DomainStatus } from '@/lib/types';

interface DomainsStatsProps {
  activeFilter: DomainStatus | 'all';
  onFilterChange: (filter: DomainStatus | 'all') => void;
}

export function DomainsStats({ activeFilter, onFilterChange }: DomainsStatsProps) {
  const total = mockDomains.length;
  const active = mockDomains.filter((d) => d.status === 'active').length;
  const expired = mockDomains.filter((d) => d.status === 'expired').length;
  const pending = mockDomains.filter((d) => d.status === 'pending').length;

  const now = new Date();
  const expiringSoon = mockDomains.filter((d) => {
    const exp = new Date(d.expiry_date);
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 90 && d.status === 'active';
  }).length;

  const cards = [
    { label: 'All Domains', value: total, icon: Globe, filter: 'all' as const, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active', value: active, icon: CheckCircle, filter: 'active' as const, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Expiring Soon', value: expiringSoon, icon: AlertTriangle, filter: 'all' as const, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Expired', value: expired, icon: XCircle, filter: 'expired' as const, color: 'text-red-600', bg: 'bg-red-500/10' },
    { label: 'Pending', value: pending, icon: Clock, filter: 'pending' as const, color: 'text-slate-500', bg: 'bg-slate-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
