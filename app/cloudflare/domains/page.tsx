'use client';

import { useState } from 'react';
import { mockCloudflareDomains, mockDomains, mockCloudflareAccounts } from '@/lib/mock-data';
import type { CloudflareSSLMode, CloudflareCacheLevel, CloudflareSecurityLevel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, MoveHorizontal as MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, Shield, CircleCheck as CheckCircle2, Lock } from 'lucide-react';

const getDomainName = (domainId: number) => {
  const domain = mockDomains.find(d => d.id === domainId);
  return domain ? domain.domain_name : 'Unknown';
};

const getAccountName = (accountId: number) => {
  const account = mockCloudflareAccounts.find(a => a.id === accountId);
  return account ? account.account_name : 'Unknown';
};

const sslModeColor = (mode: CloudflareSSLMode) => {
  switch (mode) {
    case 'strict':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'full':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'flexible':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'off':
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

const cacheLevelColor = (level: CloudflareCacheLevel) => {
  switch (level) {
    case 'aggressive':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'basic':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'simplified':
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const securityLevelColor = (level: CloudflareSecurityLevel) => {
  switch (level) {
    case 'under_attack':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'medium':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'essentially_off':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'off':
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function CloudflareDomainsPage() {
  const [search, setSearch] = useState('');

  const totalDomains = mockCloudflareDomains.length;
  const activeDomains = mockCloudflareDomains.filter(d => d.is_active).length;

  const sslModeCounts = mockCloudflareDomains.reduce((acc, d) => {
    acc[d.ssl_mode] = (acc[d.ssl_mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = mockCloudflareDomains.filter((d) => {
    const domainName = getDomainName(d.domain_id);
    return domainName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">Cloudflare Domains</h1>
            <p className="text-sm text-muted-foreground">Manage domains connected to Cloudflare</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CF Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDomains}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeDomains}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSL Strict</CardTitle>
                <Lock className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sslModeCounts['strict'] || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSL Full</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sslModeCounts['full'] || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSL Flexible/Off</CardTitle>
                <Shield className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(sslModeCounts['flexible'] || 0) + (sslModeCounts['off'] || 0)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by domain name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button size="sm" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Zone ID</TableHead>
                  <TableHead>SSL Mode</TableHead>
                  <TableHead>Cache Level</TableHead>
                  <TableHead>Security Level</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Activated</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cfDomain) => (
                  <TableRow key={cfDomain.id}>
                    <TableCell className="font-medium">{getDomainName(cfDomain.domain_id)}</TableCell>
                    <TableCell>{getAccountName(cfDomain.cloudflare_account_id)}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {cfDomain.zone_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={sslModeColor(cfDomain.ssl_mode)}>
                        {cfDomain.ssl_mode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cacheLevelColor(cfDomain.cache_level)}>
                        {cfDomain.cache_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={securityLevelColor(cfDomain.security_level)}>
                        {cfDomain.security_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cfDomain.is_active
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                        }
                      >
                        {cfDomain.is_active ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{cfDomain.activated_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No Cloudflare domains found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
  );
}
