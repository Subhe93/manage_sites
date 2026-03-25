'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X,
  Monitor,
  Globe,
  Server,
  User,
  Code,
  ExternalLink,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  DollarSign,
  CreditCard,
  Settings,
  RefreshCw,
} from 'lucide-react';
import {
  mockDomains,
  mockClients,
  mockServers,
  mockServerAccounts,
  mockSSLCertificates,
  mockWebsiteCosts,
} from '@/lib/mock-data';
import type { Website, WebsiteStatus } from '@/lib/types';

const statusStyles: Record<WebsiteStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-600 border-red-500/20',
  archived: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

interface WebsiteDetailPanelProps {
  website: Website;
  onClose: () => void;
}

export function WebsiteDetailPanel({ website, onClose }: WebsiteDetailPanelProps) {
  const domain = mockDomains.find((d) => d.id === website.domain_id);
  const client = mockClients.find((c) => c.id === website.client_id);
  const account = mockServerAccounts.find((a) => a.id === website.server_account_id);
  const server = account ? mockServers.find((s) => s.id === account.server_id) : null;
  const ssl = mockSSLCertificates.find((c) => c.website_id === website.id);
  const costs = mockWebsiteCosts.filter((c) => c.website_id === website.id);
  const totalMonthlyCost = costs.reduce((sum, c) => {
    if (c.billing_cycle === 'monthly') return sum + c.cost_amount;
    if (c.billing_cycle === 'yearly') return sum + c.cost_amount / 12;
    return sum + c.cost_amount;
  }, 0);

  const sslDaysLeft = ssl
    ? Math.ceil((new Date(ssl.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{website.website_name}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              {domain?.domain_name || website.website_url}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`capitalize ${statusStyles[website.status]}`}>
            {website.status}
          </Badge>
          <Badge variant="secondary" className="text-[11px] capitalize">
            {website.website_type === 'mobile_app' ? 'Mobile App' : website.website_type}
          </Badge>
          <Badge
            variant="secondary"
            className={`text-[11px] capitalize ${
              website.environment === 'production'
                ? 'bg-emerald-500/10 text-emerald-600'
                : website.environment === 'staging'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-sky-500/10 text-sky-600'
            }`}
          >
            {website.environment}
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Website Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="font-medium flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5 text-muted-foreground" />
                  {website.framework}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {client?.client_name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Website URL</p>
                {website.website_url ? (
                  <a
                    href={website.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {website.website_url.replace('https://', '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admin URL</p>
                {website.admin_url ? (
                  <a
                    href={website.admin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {website.admin_url.replace('https://', '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium text-muted-foreground">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="font-medium">{website.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{website.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(server || account) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Hosting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Server</p>
                  <p className="font-medium">{server?.server_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-mono text-xs font-medium">{server?.ip_address || '-'}</p>
                </div>
                {account && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Account</p>
                      <p className="font-mono text-xs font-medium">{account.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Panel</p>
                      <p className="font-medium capitalize">{account.account_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Disk Usage</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full ${
                              account.disk_usage_mb / account.disk_limit_mb >= 0.9
                                ? 'bg-red-500'
                                : account.disk_usage_mb / account.disk_limit_mb >= 0.7
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(account.disk_usage_mb / account.disk_limit_mb) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs">{(account.disk_usage_mb / 1000).toFixed(1)}GB</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Server Location</p>
                      <p className="text-sm">{server?.location || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              SSL Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ssl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {ssl.status === 'active' && sslDaysLeft > 14 ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {ssl.status === 'active' ? (
                        sslDaysLeft > 14 ? 'Certificate Valid' : `Expiring in ${sslDaysLeft} days`
                      ) : (
                        'Certificate Expired'
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{ssl.domain_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Issuer</p>
                    <p className="font-medium">{ssl.issuer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium uppercase">{ssl.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued</p>
                    <p className="font-medium">{ssl.issued_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className={`font-medium ${sslDaysLeft <= 14 ? 'text-red-600' : ''}`}>
                      {ssl.expiry_date}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <RefreshCw className={`h-3.5 w-3.5 ${ssl.auto_renew ? 'text-emerald-600' : 'text-muted-foreground/40'}`} />
                      <span className="text-xs">{ssl.auto_renew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <span>No SSL certificate configured</span>
              </div>
            )}
          </CardContent>
        </Card>

        {costs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Costs ({costs.length})
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  ~${totalMonthlyCost.toFixed(2)}/mo
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{cost.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Next: {cost.next_billing_date}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${cost.cost_amount}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        /{cost.billing_cycle === 'yearly' ? 'yr' : cost.billing_cycle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {domain && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Domain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Domain Name</p>
                  <p className="font-medium">{domain.domain_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={`text-[11px] capitalize ${
                      domain.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : domain.status === 'expired'
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                  >
                    {domain.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{domain.expiry_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auto-Renew</p>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${domain.auto_renew ? 'text-emerald-600' : 'text-muted-foreground/40'}`} />
                    <span className="text-sm">{domain.auto_renew ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
