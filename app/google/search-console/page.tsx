'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MoveHorizontal as MoreHorizontal, Pencil, Plus, Search, Trash2, Globe, Users } from 'lucide-react';
import {
  mockGoogleSearchConsoleAccounts,
  mockGoogleSearchConsoleProperties,
  mockWebsites,
  mockDomains,
} from '@/lib/mock-data';

export default function GoogleSearchConsolePage() {
  const [accountSearch, setAccountSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');

  const filteredAccounts = mockGoogleSearchConsoleAccounts.filter(
    (account) =>
      account.account_name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      account.account_email.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const filteredProperties = mockGoogleSearchConsoleProperties.filter(
    (property) => {
      const account = mockGoogleSearchConsoleAccounts.find(
        (a) => a.id === property.gsc_account_id
      );
      const website = property.website_id
        ? mockWebsites.find((w) => w.id === property.website_id)
        : null;
      const domain = property.domain_id
        ? mockDomains.find((d) => d.id === property.domain_id)
        : null;
      const searchLower = propertySearch.toLowerCase();
      return (
        property.property_url.toLowerCase().includes(searchLower) ||
        (account?.account_name.toLowerCase().includes(searchLower) ?? false) ||
        (website?.website_name.toLowerCase().includes(searchLower) ?? false) ||
        (domain?.domain_name.toLowerCase().includes(searchLower) ?? false)
      );
    }
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'suspended':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'domain':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'url_prefix':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const verificationMethodColor = (method: string) => {
    switch (method) {
      case 'dns':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'html_tag':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'html_file':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'google_analytics':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'google_tag_manager':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Google Search Console
            </h1>
            <p className="text-muted-foreground">
              Manage Search Console accounts and properties
            </p>
          </div>
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts" className="gap-2">
              <Users className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Globe className="h-4 w-4" />
              Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.account_name}
                        </TableCell>
                        <TableCell>{account.account_email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColor(account.status)}
                          >
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {account.notes || '-'}
                        </TableCell>
                        <TableCell>{account.created_at}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
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
                    {filteredAccounts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No accounts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property URL</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Verification Method</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Verified At</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => {
                      const account = mockGoogleSearchConsoleAccounts.find(
                        (a) => a.id === property.gsc_account_id
                      );
                      const website = property.website_id
                        ? mockWebsites.find((w) => w.id === property.website_id)
                        : null;
                      const domain = property.domain_id
                        ? mockDomains.find((d) => d.id === property.domain_id)
                        : null;
                      return (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            {property.property_url}
                          </TableCell>
                          <TableCell>
                            {account?.account_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            {website?.website_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            {domain?.domain_name ?? '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={typeColor(property.property_type)}
                            >
                              {property.property_type === 'url_prefix'
                                ? 'URL Prefix'
                                : 'Domain'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={verificationMethodColor(
                                property.verification_method
                              )}
                            >
                              {property.verification_method.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                property.is_verified
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {property.is_verified ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {property.verified_at ?? '-'}
                          </TableCell>
                          <TableCell>{property.created_at}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
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
                      );
                    })}
                    {filteredProperties.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No properties found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
