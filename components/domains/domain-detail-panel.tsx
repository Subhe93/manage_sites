'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import {
  mockClients,
  mockProviders,
  mockDomainCosts,
  mockWhoisHistory,
  mockWebsites,
} from '@/lib/mock-data';
import type { Domain, DomainStatus } from '@/lib/types';

const statusStyles: Record<DomainStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  expired: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  deleted: 'bg-red-800/10 text-red-800 border-red-800/20',
};

function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getLifecycleProgress(regDate: string, expDate: string): number {
  const reg = new Date(regDate).getTime();
  const exp = new Date(expDate).getTime();
  const now = Date.now();
  if (now >= exp) return 100;
  if (now <= reg) return 0;
  return Math.round(((now - reg) / (exp - reg)) * 100);
}

interface DomainDetailPanelProps {
  domain: Domain;
  onClose: () => void;
}

export function DomainDetailPanel({ domain, onClose }: DomainDetailPanelProps) {
  const client = mockClients.find((c) => c.id === domain.client_id);
  const registrar = mockProviders.find((p) => p.id === domain.registrar_id);
  const cost = mockDomainCosts.find((c) => c.domain_id === domain.id);
  const whois = mockWhoisHistory.find((w) => w.domain_id === domain.id);
  const websites = mockWebsites.filter((w) => w.domain_id === domain.id);
  const daysLeft = getDaysUntilExpiry(domain.expiry_date);
  const lifecycle = getLifecycleProgress(domain.registration_date, domain.expiry_date);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{domain.domain_name}</h2>
            <p className="text-xs text-muted-foreground">
              {registrar?.provider_name || 'Unknown registrar'} {domain.tld}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`capitalize ${statusStyles[domain.status]}`}>
            {domain.status}
          </Badge>
          <Badge variant="outline" className={`text-[11px] ${daysLeft < 0 ? 'bg-red-500/10 text-red-600 border-red-500/20' : daysLeft <= 30 ? 'bg-red-500/10 text-red-600 border-red-500/20' : daysLeft <= 90 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
            {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} days remaining`}
          </Badge>
          {domain.auto_renew && (
            <Badge variant="secondary" className="text-[11px] gap-1">
              <RefreshCw className="h-3 w-3" /> Auto-Renew
            </Badge>
          )}
          {domain.whois_privacy ? (
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Shield className="h-3 w-3" /> WHOIS Privacy
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
              <ShieldOff className="h-3 w-3" /> No Privacy
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Registration Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Registered: {domain.registration_date}</span>
              <span>Expires: {domain.expiry_date}</span>
            </div>
            <Progress value={lifecycle} className="h-2" />
            <p className="text-[11px] text-muted-foreground text-center">{lifecycle}% of registration period elapsed</p>
          </CardContent>
        </Card>

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
                <p className="font-medium">{client?.client_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrar</p>
                <p className="font-medium">{registrar?.provider_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registration Date</p>
                <p className="font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {domain.registration_date}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiry Date</p>
                <p className="font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {domain.expiry_date}
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
                <p className="font-medium">{domain.renewal_notification_days} days before</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{domain.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {cost && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Cost Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold text-primary">
                    {cost.currency === 'USD' ? '$' : cost.currency + ' '}{cost.cost_amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium capitalize">{cost.billing_cycle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {cost.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Billing</p>
                  <p className="font-medium">{cost.next_billing_date}</p>
                </div>
                {cost.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{cost.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {whois && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                WHOIS Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Registrant</p>
                    <p className="font-medium">{whois.registrant_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{whois.registrant_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Organization</p>
                    <p className="font-medium">{whois.registrant_organization}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Admin Contact</p>
                    <p className="text-sm font-medium">{whois.admin_contact}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tech Contact</p>
                    <p className="text-sm font-medium">{whois.tech_contact}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Last captured: {whois.captured_at}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {websites.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Linked Websites ({websites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{website.website_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">{website.website_type}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{website.environment}</Badge>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        website.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {website.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
