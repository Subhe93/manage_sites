'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Server, Activity, TriangleAlert as AlertTriangle, Cpu, HardDrive } from 'lucide-react';
import { mockServers, mockServerMonitoring } from '@/lib/mock-data';
import type { ServerStatus } from '@/lib/types';

interface ServersStatsProps {
  activeFilter: ServerStatus | 'all';
  onFilterChange: (filter: ServerStatus | 'all') => void;
}

export function ServersStats({ activeFilter, onFilterChange }: ServersStatsProps) {
  const total = mockServers.length;
  const active = mockServers.filter((s) => s.status === 'active').length;
  const maintenance = mockServers.filter((s) => s.status === 'maintenance').length;

  const avgCpu = mockServerMonitoring
    .filter((m) => m.cpu_usage > 0)
    .reduce((sum, m, _, arr) => sum + m.cpu_usage / arr.length, 0);

  const avgRam = mockServerMonitoring
    .filter((m) => m.ram_usage > 0)
    .reduce((sum, m, _, arr) => sum + m.ram_usage / arr.length, 0);

  const cards = [
    { label: 'All Servers', value: total, icon: Server, filter: 'all' as const, color: 'text-primary', bg: 'bg-primary/10', suffix: '' },
    { label: 'Active', value: active, icon: Activity, filter: 'active' as const, color: 'text-emerald-600', bg: 'bg-emerald-500/10', suffix: '' },
    { label: 'Maintenance', value: maintenance, icon: AlertTriangle, filter: 'maintenance' as const, color: 'text-amber-600', bg: 'bg-amber-500/10', suffix: '' },
    { label: 'Avg CPU', value: avgCpu.toFixed(1), icon: Cpu, filter: 'all' as const, color: 'text-sky-600', bg: 'bg-sky-500/10', suffix: '%' },
    { label: 'Avg RAM', value: avgRam.toFixed(1), icon: HardDrive, filter: 'all' as const, color: 'text-teal-600', bg: 'bg-teal-500/10', suffix: '%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filter && card.label !== 'Avg CPU' && card.label !== 'Avg RAM';
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
                <p className="text-2xl font-bold">{card.value}{card.suffix}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
