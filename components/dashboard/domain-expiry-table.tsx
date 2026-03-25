'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDomains, mockClients } from '@/lib/mock-data';
import { Globe, ExternalLink } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-[hsl(162,63%,41%)]/10 text-[hsl(162,63%,41%)] border-[hsl(162,63%,41%)]/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-[hsl(43,96%,46%)]/10 text-[hsl(43,76%,36%)] border-[hsl(43,96%,46%)]/20',
  suspended: 'bg-[hsl(215,20%,65%)]/10 text-[hsl(215,20%,45%)] border-[hsl(215,20%,65%)]/20',
};

function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryBadge(days: number) {
  if (days < 0) return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
  if (days <= 30) return <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20" variant="outline">{days}d left</Badge>;
  if (days <= 90) return <Badge className="text-[10px] bg-[hsl(43,96%,46%)]/10 text-[hsl(43,76%,36%)] border-[hsl(43,96%,46%)]/20" variant="outline">{days}d left</Badge>;
  return <Badge className="text-[10px] bg-[hsl(162,63%,41%)]/10 text-[hsl(162,63%,41%)] border-[hsl(162,63%,41%)]/20" variant="outline">{days}d left</Badge>;
}

export function DomainExpiryTable() {
  const sortedDomains = [...mockDomains].sort((a, b) => {
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Domain Expiry Tracker
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {mockDomains.length} domains
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Domain</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Expiry</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Remaining</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedDomains.map((domain) => {
                const client = mockClients.find(c => c.id === domain.client_id);
                const daysLeft = getDaysUntilExpiry(domain.expiry_date);

                return (
                  <tr key={domain.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{domain.domain_name}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {client?.client_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${statusColors[domain.status] || ''}`}>
                        {domain.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {domain.expiry_date}
                    </td>
                    <td className="px-4 py-3">
                      {getExpiryBadge(daysLeft)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block h-2 w-2 rounded-full ${domain.auto_renew ? 'bg-[hsl(162,63%,41%)]' : 'bg-muted-foreground/30'}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
