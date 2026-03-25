'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockActivityLogs } from '@/lib/mock-data';
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  Globe,
  Server,
  Monitor,
  Users,
  Shield,
  Archive,
} from 'lucide-react';

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
};

const entityIcons: Record<string, React.ElementType> = {
  domain: Globe,
  server: Server,
  website: Monitor,
  client: Users,
  user: Users,
  backup: Archive,
  ssl: Shield,
};

const actionColors: Record<string, string> = {
  create: 'bg-[hsl(162,63%,41%)]/10 text-[hsl(162,63%,41%)]',
  update: 'bg-primary/10 text-primary',
  delete: 'bg-destructive/10 text-destructive',
  login: 'bg-[hsl(215,20%,65%)]/10 text-[hsl(215,20%,50%)]',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {mockActivityLogs.map((log) => {
            const ActionIcon = actionIcons[log.action_type] || Pencil;
            const EntityIcon = entityIcons[log.entity_type] || Globe;

            return (
              <div key={log.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${actionColors[log.action_type] || 'bg-muted text-muted-foreground'}`}>
                  <ActionIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.description}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                      <EntityIcon className="h-2.5 w-2.5" />
                      {log.entity_name}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimeAgo(log.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
