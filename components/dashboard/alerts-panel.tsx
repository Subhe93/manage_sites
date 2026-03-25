'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '@/lib/mock-data';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, Bell } from 'lucide-react';

const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[hsl(43,76%,36%)]',
    bg: 'bg-[hsl(43,96%,46%)]/10 border-[hsl(43,96%,46%)]/20',
  },
  info: {
    icon: Info,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
};

export function AlertsPanel() {
  const unreadAlerts = mockNotifications.filter(n => !n.is_read);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Active Alerts
          </CardTitle>
          <Badge variant="destructive" className="text-[10px]">
            {unreadAlerts.length} unread
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {mockNotifications.slice(0, 6).map((notification) => {
          const config = severityConfig[notification.severity];
          const SeverityIcon = config.icon;

          return (
            <div
              key={notification.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-150 hover:shadow-sm ${
                notification.is_read ? 'opacity-60' : ''
              } ${config.bg}`}
            >
              <SeverityIcon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {!notification.is_read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notification.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{notification.created_at}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
