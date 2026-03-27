'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Globe, Server, Monitor, Users } from 'lucide-react';
import type { UpcomingPayment } from '@/hooks/use-dashboard';

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
  loading: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  domain: Globe,
  server: Server,
  website: Monitor,
  client: Users,
};

const typeColors: Record<string, string> = {
  domain: 'text-[hsl(199,89%,38%)]',
  server: 'text-[hsl(162,63%,41%)]',
  website: 'text-[hsl(215,20%,65%)]',
  client: 'text-[hsl(43,96%,46%)]',
};

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function UpcomingPayments({ payments, loading }: UpcomingPaymentsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Upcoming Payments
          </CardTitle>
          {payments.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {payments.length} due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming payments</p>
        ) : (
          <div className="divide-y">
            {payments.map((payment, index) => {
              const TypeIcon = typeIcons[payment.type] || CreditCard;
              const days = payment.date ? getDaysUntil(payment.date) : null;

              return (
                <div key={`${payment.type}-${payment.name}-${index}`} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 ${typeColors[payment.type] || 'text-muted-foreground'}`}>
                    <TypeIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{payment.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {payment.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{payment.cycle}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {payment.currency}
                    </p>
                    {days !== null && (
                      <p className={`text-[10px] ${days <= 7 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {days <= 0 ? 'Due today' : `in ${days}d`}
                      </p>
                    )}
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
