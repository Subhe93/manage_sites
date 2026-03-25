'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Monitor,
  Calendar,
  Building2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { mockDomains, mockWebsites } from '@/lib/mock-data';
import type { Client, ClientStatus } from '@/lib/types';

const statusStyles: Record<ClientStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  inactive: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
};

interface ClientDetailPanelProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetailPanel({ client, onClose }: ClientDetailPanelProps) {
  const clientDomains = mockDomains.filter((d) => d.client_id === client.id);
  const clientWebsites = mockWebsites.filter((w) => w.client_id === client.id);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {client.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-base font-semibold">{client.client_name}</h2>
            <p className="text-xs text-muted-foreground">{client.company_name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`capitalize ${statusStyles[client.status]}`}>
            {client.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Client since {client.created_at}
          </span>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.country}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Created {client.created_at}</span>
            </div>
          </CardContent>
        </Card>

        {client.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Domains ({clientDomains.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">No domains assigned.</p>
            ) : (
              <div className="space-y-2">
                {clientDomains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{domain.domain_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          domain.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : domain.status === 'expired'
                            ? 'bg-red-500/10 text-red-600 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {domain.status}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        Exp: {domain.expiry_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              Websites ({clientWebsites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientWebsites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No websites assigned.</p>
            ) : (
              <div className="space-y-2">
                {clientWebsites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{website.website_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {website.website_type}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {website.environment}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          website.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {website.status}
                      </Badge>
                      {website.website_url && (
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">{clientDomains.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Domains</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">{clientWebsites.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Websites</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-2xl font-bold text-primary">
              {clientDomains.filter(d => d.status === 'active').length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
