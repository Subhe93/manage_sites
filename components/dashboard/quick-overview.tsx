'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Monitor, ExternalLink } from 'lucide-react';
import type { WebsiteOverview } from '@/hooks/use-dashboard';

interface QuickOverviewProps {
  websites: WebsiteOverview[];
  loading: boolean;
}

const typeColors: Record<string, string> = {
  wordpress: 'bg-[hsl(199,89%,38%)]/10 text-[hsl(199,89%,38%)]',
  spa: 'bg-[hsl(162,63%,41%)]/10 text-[hsl(162,63%,41%)]',
  ecommerce: 'bg-[hsl(43,96%,46%)]/10 text-[hsl(43,76%,36%)]',
  custom: 'bg-[hsl(215,20%,65%)]/10 text-[hsl(215,20%,45%)]',
  static: 'bg-muted text-muted-foreground',
  mobile_app: 'bg-primary/10 text-primary',
};

const statusDot: Record<string, string> = {
  active: 'bg-[hsl(162,63%,41%)]',
  maintenance: 'bg-[hsl(43,96%,46%)]',
  suspended: 'bg-destructive',
  archived: 'bg-muted-foreground',
};

export function QuickOverview({ websites, loading }: QuickOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Websites Overview
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {websites.length} sites
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))
        ) : websites.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No websites found</p>
        ) : (
          websites.map((website) => (
            <div
              key={website.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot[website.status] || 'bg-muted-foreground'}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{website.websiteName}</p>
                    {website.websiteUrl && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {website.domain?.domainName || '-'} &middot; {website.client?.clientName || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge variant="secondary" className={`text-[10px] ${typeColors[website.websiteType] || ''}`}>
                  {website.websiteType}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {website.environment}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
