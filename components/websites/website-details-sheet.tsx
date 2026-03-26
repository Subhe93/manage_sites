'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useWebsite } from '@/hooks/use-websites';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Server, Key, Link2, FileText, ExternalLink, Activity, LayoutTemplate } from 'lucide-react';
import { PasswordDisplay } from '@/components/ui/password-display';

interface WebsiteDetailsSheetProps {
  websiteId: number | null;
  onClose: () => void;
}

export function WebsiteDetailsSheet({ websiteId, onClose }: WebsiteDetailsSheetProps) {
  const { website, loading } = useWebsite(websiteId || 0);

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, any> = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700' },
      maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700' },
      suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
      archived: { label: 'Archived', color: 'bg-gray-100 text-gray-700' },
    };

    const config = variants[status || ''] || { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type?: string) => {
    if (!type) return null;
    const variants: Record<string, any> = {
      wordpress: { label: 'WordPress', color: 'bg-sky-100 text-sky-700' },
      spa: { label: 'SPA', color: 'bg-teal-100 text-teal-700' },
      ecommerce: { label: 'E-commerce', color: 'bg-emerald-100 text-emerald-700' },
      custom: { label: 'Custom', color: 'bg-slate-100 text-slate-700' },
      static: { label: 'Static', color: 'bg-stone-100 text-stone-700' },
      mobile_app: { label: 'Mobile App', color: 'bg-cyan-100 text-cyan-700' },
    };

    const config = variants[type] || { label: type, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getEnvBadge = (env?: string) => {
    if (!env) return null;
    const variants: Record<string, any> = {
      production: { label: 'Production', color: 'bg-emerald-100 text-emerald-700' },
      staging: { label: 'Staging', color: 'bg-amber-100 text-amber-700' },
      development: { label: 'Development', color: 'bg-sky-100 text-sky-700' },
    };

    const config = variants[env] || { label: env, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const adminCreds = website?.credentials?.find(c => c.credentialType === 'admin');

  return (
    <Sheet open={!!websiteId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6 space-y-2">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {loading ? <Skeleton className="h-8 w-40" /> : website?.websiteName}
          </SheetTitle>
          <div className="flex gap-2 flex-wrap">
            {getStatusBadge(website?.status)}
            {getTypeBadge(website?.websiteType)}
            {getEnvBadge(website?.environment)}
          </div>
        </SheetHeader>

        {loading || !website ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* General Info */}
            <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                <Globe className="h-4 w-4" />
                General Info
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Domain</p>
                  <p className="font-medium">{website.domain?.domainName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Client</p>
                  <p className="font-medium">{website.client?.clientName || '-'}</p>
                </div>
                {website.websiteUrl && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">Website URL</p>
                    <a
                      href={website.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      {website.websiteUrl} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Created At</p>
                  <p className="font-medium">{new Date(website.createdAt).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                <Server className="h-4 w-4" />
                Technical Details
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Server Account</p>
                  <p className="font-medium">
                    {website.serverAccount
                      ? `${website.serverAccount.username} @ ${website.serverAccount.server?.serverName || '-'}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Framework</p>
                  <p className="font-medium">{website.framework || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Database Name</p>
                  <p className="font-medium">{website.databaseName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Database Type</p>
                  <p className="font-medium uppercase">{website.databaseType || '-'}</p>
                </div>
                {website.apiEndpoint && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">API Endpoint</p>
                    <p className="font-medium break-all">{website.apiEndpoint}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Login & Access */}
            <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                <Key className="h-4 w-4" />
                Login & Access
              </h3>
              <div className="grid grid-cols-1 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Admin URL</p>
                  {website.adminUrl ? (
                    <a
                      href={website.adminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-medium break-all"
                    >
                      {website.adminUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Username / Email</p>
                    <p className="font-medium">{adminCreds?.username || '-'}</p>
                  </div>
                  <div className="mt-2 flex flex-col items-start">
                    <p className="text-muted-foreground mb-1">Password</p>
                    <PasswordDisplay value={adminCreds?.passwordEncrypted} />
                  </div>
                </div>
              </div>
            </div>

            {/* Google Integrations */}
            <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                <Link2 className="h-4 w-4" />
                Integrations
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Google Analytics</p>
                  <p className="font-medium">{website.googleAnalyticsAccount?.accountName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Search Console</p>
                  <p className="font-medium">{website.googleSearchConsoleAccount?.accountName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Google Ads</p>
                  <p className="font-medium">{website.googleAdsAccount?.accountName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Tag Manager</p>
                  <p className="font-medium">{website.googleTagManagerAccount?.accountName || '-'}</p>
                </div>
              </div>
            </div>

            {/* Subdomains */}
            {website.subdomains && website.subdomains.length > 0 && (
              <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                  <LayoutTemplate className="h-4 w-4" />
                  Subdomains
                </h3>
                <div className="space-y-6">
                  {website.subdomains.map((sub: any) => (
                    <div key={sub.id || sub.subdomainName} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-muted">
                        <div className="font-semibold text-base flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {sub.subdomainName}
                        </div>
                        {getTypeBadge(sub.websiteType)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        {sub.fullUrl && (
                          <div className="col-span-1 sm:col-span-2">
                            <p className="text-muted-foreground mb-1">URL</p>
                            <a
                              href={sub.fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-medium break-all"
                            >
                              {sub.fullUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        )}
                        {sub.framework && (
                          <div>
                            <p className="text-muted-foreground mb-1">Framework</p>
                            <p className="font-medium">{sub.framework}</p>
                          </div>
                        )}
                        {sub.adminUrl && (
                          <div className="col-span-1 sm:col-span-2 mt-2">
                            <p className="text-muted-foreground mb-1">Admin URL</p>
                            <a
                              href={sub.adminUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-medium break-all"
                            >
                              {sub.adminUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        )}
                        {(sub.adminUsername || sub.adminPassword) && (
                          <>
                            <div className="mt-2">
                              <p className="text-muted-foreground mb-1">Username / Email</p>
                              <p className="font-medium">{sub.adminUsername || '-'}</p>
                            </div>
                            <div className="mt-2 flex flex-col items-start pr-2">
                              <p className="text-muted-foreground mb-1">Password</p>
                              <PasswordDisplay value={sub.adminPassword} />
                            </div>
                          </>
                        )}
                        {sub.notes && (
                          <div className="col-span-1 sm:col-span-2 mt-2">
                            <p className="text-muted-foreground mb-1">Notes</p>
                            <p className="text-muted-foreground italic">{sub.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(website.description || website.notes) && (
              <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4 border-b pb-2">
                  <FileText className="h-4 w-4" />
                  Additional Info
                </h3>
                <div className="space-y-4 text-sm">
                  {website.description && (
                    <div>
                      <p className="text-muted-foreground mb-1">Description</p>
                      <p className="whitespace-pre-wrap">{website.description}</p>
                    </div>
                  )}
                  {website.notes && (
                    <div>
                      <p className="text-muted-foreground mb-1">Notes</p>
                      <p className="whitespace-pre-wrap">{website.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);
