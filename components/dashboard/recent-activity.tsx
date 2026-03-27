'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Briefcase,
  FileText,
  Layers,
  HelpCircle,
  Cloud,
  Bell,
  Lock,
  Settings,
} from 'lucide-react';
import type { ActivityItem } from '@/hooks/use-dashboard';

interface RecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
};

const entityIcons: Record<string, React.ElementType> = {
  domains: Globe,
  servers: Server,
  websites: Monitor,
  clients: Users,
  providers: Briefcase,
  cloudflare: Cloud,
  google: Layers,
  uptime: Activity,
  notifications: Bell,
  activity: FileText,
  users: Users,
  permissions: Lock,
  settings: Settings,
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
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="divide-y">
            {activities.map((log) => {
              const ActionIcon = actionIcons[log.actionType] || Pencil;
              const EntityIcon = entityIcons[log.entityType] || Globe;

              return (
                <div key={log.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${actionColors[log.actionType] || 'bg-muted text-muted-foreground'}`}>
                    <ActionIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.description || `${log.actionType} ${log.entityType}`}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {log.entityName && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                          <EntityIcon className="h-2.5 w-2.5" />
                          {log.entityName}
                        </Badge>
                      )}
                      {log.user && (
                        <span className="text-[10px] text-muted-foreground">
                          by {log.user.fullName || log.user.username}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
