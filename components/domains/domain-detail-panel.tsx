'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  X,
  Globe,
  Calendar,
  RefreshCw,
  Shield,
  ShieldOff,
  Server,
  DollarSign,
  User,
  Mail,
  Building2,
  FileText,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useDomain } from '@/hooks/use-domains';

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getLifecycleProgress(regDate: string | null, expDate: string | null): number {
  if (!regDate || !expDate) return 0;
  const reg = new Date(regDate).getTime();
  const exp = new Date(expDate).getTime();
  const now = Date.now();
  if (now >= exp) return 100;
  if (now <= reg) return 0;
  return Math.round(((now - reg) / (exp - reg)) * 100);
}

interface DomainDetailPanelProps {
  domainId: number;
  onClose: () => void;
}

export function DomainDetailPanel({ domainId, onClose }: DomainDetailPanelProps) {
  const { domain, loading } = useDomain(domainId);

  const daysLeft = domain ? getDaysUntilExpiry(domain.expiryDate) : null;
  const lifecycle = domain ? getLifecycleProgress(domain.registrationDate, domain.expiryDate) : 0;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold">{domain?.domainName}</h2>
                <p className="text-xs text-muted-foreground">
                  {(domain as any)?.registrar?.providerName || 'Unknown registrar'} {domain?.tld || ''}
                </p>
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : domain ? (
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`capitalize ${
              domain.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
              domain.status === 'expired' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
              domain.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
              domain.status === 'suspended' ? 'bg-slate-400/10 text-slate-500 border-slate-400/20' :
              'bg-red-800/10 text-red-800 border-red-800/20'
            }`}>
              {domain.status}
            </Badge>
            {daysLeft !== null && (
              <Badge variant="outline" className={`text-[11px] ${
                daysLeft < 0 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                daysLeft <= 30 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                daysLeft <= 90 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }`}>
                {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} days remaining`}
              </Badge>
            )}
            {domain.autoRenew && (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <RefreshCw className="h-3 w-3" /> Auto-Renew
              </Badge>
            )}
            {domain.whoisPrivacy ? (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <Shield className="h-3 w-3" /> WHOIS Privacy
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                <ShieldOff className="h-3 w-3" /> No Privacy
              </Badge>
            )}
          </div>

          {/* Registration Lifecycle */}
          {domain.registrationDate && domain.expiryDate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Registration Lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Registered: {new Date(domain.registrationDate).toLocaleDateString('en-US')}</span>
                  <span>Expires: {new Date(domain.expiryDate).toLocaleDateString('en-US')}</span>
                </div>
                <Progress value={lifecycle} className="h-2" />
                <p className="text-[11px] text-muted-foreground text-center">{lifecycle}% of registration period elapsed</p>
              </CardContent>
            </Card>
          )}

          {/* Domain Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Domain Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium">{(domain as any)?.client?.clientName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registrar</p>
                  <p className="font-medium">{(domain as any)?.registrar?.providerName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cloudflare</p>
                  <p className="font-medium">{domain?.cloudflareAccount?.accountName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registration Date</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {domain.registrationDate
                      ? new Date(domain.registrationDate).toLocaleDateString('en-US')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {domain.expiryDate
                      ? new Date(domain.expiryDate).toLocaleDateString('en-US')
                      : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Nameservers</p>
                  <p className="font-medium text-xs mt-0.5">
                    {domain.nameservers || 'Not configured'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Notification</p>
                  <p className="font-medium">{domain.renewalNotificationDays} days before</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(domain.createdAt).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Information */}
          {(domain as any)?.costs && (domain as any).costs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(domain as any).costs.map((cost: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-primary">
                        {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.costAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Billing Cycle</p>
                      <p className="font-medium capitalize">{cost.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-medium flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        {cost.paymentMethod || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Billing</p>
                      <p className="font-medium">
                        {cost.nextBillingDate
                          ? new Date(cost.nextBillingDate).toLocaleDateString('en-US')
                          : '-'}
                      </p>
                    </div>
                    {cost.notes && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm">{cost.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Linked Website */}
          {(domain as any)?.website && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Linked Website
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{(domain as any).website.websiteName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">{(domain as any).website.websiteType}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{(domain as any).website.environment}</Badge>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        (domain as any).website.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {(domain as any).website.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground">Domain not found</div>
      )}
    </div>
  );
}
