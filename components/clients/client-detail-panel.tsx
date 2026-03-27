'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Monitor,
  Calendar,
  Building2,
  FileText,
  DollarSign,
  Pencil,
  CreditCard,
  Clock,
  User,
} from 'lucide-react';
import type { Client, ClientCost } from '@/hooks/use-clients';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  inactive: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

interface ClientDetailPanelProps {
  clientId: number | null;
  open: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

function getNextPaymentDate(costs?: ClientCost[]): ClientCost | null {
  if (!costs || costs.length === 0) return null;
  const now = new Date();
  const upcoming = costs
    .filter((c) => c.nextBillingDate && new Date(c.nextBillingDate) >= now)
    .sort((a, b) => new Date(a.nextBillingDate!).getTime() - new Date(b.nextBillingDate!).getTime());
  return upcoming[0] || null;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function ClientDetailPanel({ clientId, open, onClose }: ClientDetailPanelProps) {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId && open) {
      setLoading(true);
      fetch(`/api/clients/${clientId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) setClient(result.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setClient(null);
    }
  }, [clientId, open]);

  const nextPayment = client ? getNextPaymentDate(client.costs) : null;
  const totalMonthlyCost = client?.costs?.reduce((sum: number, c: ClientCost) => {
    const monthly =
      c.billingCycle === 'monthly' ? c.costAmount :
      c.billingCycle === 'yearly' ? c.costAmount / 12 :
      c.billingCycle === 'two_years' ? c.costAmount / 24 :
      c.billingCycle === 'three_years' ? c.costAmount / 36 :
      c.billingCycle === 'five_years' ? c.costAmount / 60 :
      0;
    return sum + monthly;
  }, 0) || 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : client ? (
          <>
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {client.clientName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-base">{client.clientName}</SheetTitle>
                    <SheetDescription>{client.companyName || 'No company'}</SheetDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push(`/clients/${client.id}/edit`);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </SheetHeader>
            </div>

            <div className="p-6 space-y-5">
              {/* Status & Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`capitalize ${statusStyles[client.status] || ''}`}>
                  {client.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Since {formatDate(client.createdAt)}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="text-center p-3">
                  <p className="text-2xl font-bold text-primary">{client._count?.domains || 0}</p>
                  <p className="text-[11px] text-muted-foreground">Domains</p>
                </Card>
                <Card className="text-center p-3">
                  <p className="text-2xl font-bold text-primary">{client._count?.websites || 0}</p>
                  <p className="text-[11px] text-muted-foreground">Websites</p>
                </Card>
                <Card className="text-center p-3">
                  <p className="text-2xl font-bold text-primary">
                    {totalMonthlyCost > 0 ? formatCurrency(totalMonthlyCost, 'USD') : '-'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Monthly</p>
                </Card>
              </div>

              {/* Contact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {client.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">{client.phone}</a>
                    </div>
                  )}
                  {client.country && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{client.country}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{client.address}</span>
                    </div>
                  )}
                  {client.creator && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>Created by {client.creator.fullName || client.creator.username}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Costs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Costs ({client.costs?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!client.costs || client.costs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No costs recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {client.costs.map((cost: ClientCost) => {
                        const isUpcoming = cost.nextBillingDate && getDaysUntil(cost.nextBillingDate) <= 30 && getDaysUntil(cost.nextBillingDate) >= 0;
                        const isOverdue = cost.nextBillingDate && getDaysUntil(cost.nextBillingDate) < 0;
                        return (
                          <div
                            key={cost.id}
                            className={`rounded-md border p-2.5 space-y-1 ${
                              isOverdue ? 'border-red-300 bg-red-50/50' : isUpcoming ? 'border-amber-300 bg-amber-50/50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium capitalize">{cost.costType}</span>
                              </div>
                              <span className="text-sm font-semibold">{formatCurrency(cost.costAmount, cost.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="capitalize">{cost.billingCycle?.replace('_', ' ')}</span>
                              {cost.nextBillingDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span className={isOverdue ? 'text-red-600 font-medium' : isUpcoming ? 'text-amber-600 font-medium' : ''}>
                                    {isOverdue
                                      ? `Overdue ${Math.abs(getDaysUntil(cost.nextBillingDate))}d`
                                      : `Due ${formatDate(cost.nextBillingDate)}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            {cost.description && (
                              <p className="text-xs text-muted-foreground">{cost.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {client.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Domains */}
              {client.domains && client.domains.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Domains ({client.domains.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.domains.map((domain: any) => (
                        <div
                          key={domain.id}
                          className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{domain.domainName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize ${statusStyles[domain.status] || ''}`}
                            >
                              {domain.status}
                            </Badge>
                            {domain.expiryDate && (
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(domain.expiryDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Websites */}
              {client.websites && client.websites.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-primary" />
                      Websites ({client.websites.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.websites.map((website: any) => (
                        <div
                          key={website.id}
                          className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{website.websiteName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] capitalize">
                                {website.websiteType}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] capitalize">
                                {website.environment}
                              </Badge>
                            </div>
                          </div>
                          {website.domain && (
                            <span className="text-xs text-muted-foreground">{website.domain.domainName}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p>Client not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
