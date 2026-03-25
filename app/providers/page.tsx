'use client';

import { useState } from 'react';
import { mockProviders } from '@/lib/mock-data';
import type { ServiceProvider, ProviderType } from '@/lib/types';
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
import { Building2, Globe, Shield, Server, MoveHorizontal as MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, ExternalLink, Layers } from 'lucide-react';

const providerTypeColor = (type: ProviderType) => {
  switch (type) {
    case 'registrar':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'hosting':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'cdn':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'ssl':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'other':
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProviderType | 'all'>('all');

  const totalProviders = mockProviders.length;
  const registrarCount = mockProviders.filter(p => p.provider_type === 'registrar').length;
  const hostingCount = mockProviders.filter(p => p.provider_type === 'hosting').length;
  const cdnCount = mockProviders.filter(p => p.provider_type === 'cdn').length;
  const sslCount = mockProviders.filter(p => p.provider_type === 'ssl').length;
  const otherCount = mockProviders.filter(p => p.provider_type === 'other').length;

  const filtered = mockProviders.filter((p) => {
    const matchesSearch = p.provider_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.provider_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">Service Providers</h1>
            <p className="text-sm text-muted-foreground">Manage your registrars, hosting, CDN, and SSL providers</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProviders}</div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'registrar' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'registrar' ? 'all' : 'registrar')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registrars</CardTitle>
                <Globe className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrarCount}</div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'hosting' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'hosting' ? 'all' : 'hosting')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hosting</CardTitle>
                <Server className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hostingCount}</div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'cdn' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'cdn' ? 'all' : 'cdn')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CDN</CardTitle>
                <Layers className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cdnCount}</div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'ssl' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'ssl' ? 'all' : 'ssl')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSL</CardTitle>
                <Shield className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sslCount}</div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${typeFilter === 'other' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setTypeFilter(typeFilter === 'other' ? 'all' : 'other')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Other</CardTitle>
                <Building2 className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{otherCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button size="sm" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Add Provider
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Website URL</TableHead>
                  <TableHead>Support Email</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.provider_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={providerTypeColor(provider.provider_type)}>
                        {provider.provider_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={provider.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {provider.website_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>{provider.support_email || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{provider.notes || '-'}</TableCell>
                    <TableCell>{provider.created_at}</TableCell>
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
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No providers found.
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
