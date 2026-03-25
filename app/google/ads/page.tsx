'use client';

import { useState } from 'react';
import {
  mockGoogleAdsAccounts,
  mockGoogleAdsCampaigns,
  mockDomains,
  mockWebsites,
} from '@/lib/mock-data';
import type { AccountStatus, CampaignStatus, CampaignType } from '@/lib/types';
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
import { MoveHorizontal as MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, Megaphone, Users, CircleCheck as CheckCircle2, CirclePause as PauseCircle, Circle as XCircle, DollarSign } from 'lucide-react';

const accountStatusColor = (status: AccountStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'inactive':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'suspended':
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

const campaignStatusColor = (status: CampaignStatus) => {
  switch (status) {
    case 'enabled':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'paused':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'removed':
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

const campaignTypeColor = (type: CampaignType) => {
  switch (type) {
    case 'search':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'display':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'video':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'shopping':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'app':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'smart':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'performance_max':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  }
};

const getAccountName = (accountId: number) => {
  const account = mockGoogleAdsAccounts.find(a => a.id === accountId);
  return account ? account.account_name : 'Unknown';
};

const getWebsiteName = (websiteId: number | null) => {
  if (!websiteId) return '-';
  const website = mockWebsites.find(w => w.id === websiteId);
  return website ? website.website_name : 'Unknown';
};

const getDomainName = (domainId: number | null) => {
  if (!domainId) return '-';
  const domain = mockDomains.find(d => d.id === domainId);
  return domain ? domain.domain_name : 'Unknown';
};

export default function GoogleAdsPage() {
  const [accountSearch, setAccountSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const totalCampaigns = mockGoogleAdsCampaigns.length;
  const enabledCampaigns = mockGoogleAdsCampaigns.filter(c => c.status === 'enabled').length;
  const pausedCampaigns = mockGoogleAdsCampaigns.filter(c => c.status === 'paused').length;
  const removedCampaigns = mockGoogleAdsCampaigns.filter(c => c.status === 'removed').length;

  const filteredAccounts = mockGoogleAdsAccounts.filter((a) =>
    a.account_name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    a.account_email.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const filteredCampaigns = mockGoogleAdsCampaigns.filter((c) => {
    const matchesSearch = c.campaign_name.toLowerCase().includes(campaignSearch.toLowerCase());
    const matchesStatus = campaignStatusFilter === 'all' || c.status === campaignStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
            <p className="text-sm text-muted-foreground">Manage Google Ads accounts and campaigns</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Tabs defaultValue="accounts">
            <TabsList>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-6">
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button size="sm" className="h-9 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            {account.account_name}
                          </div>
                        </TableCell>
                        <TableCell>{account.account_email}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {account.customer_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={accountStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{account.notes || '-'}</TableCell>
                        <TableCell>{account.created_at}</TableCell>
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
                    {filteredAccounts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No accounts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4 mt-4">
                <Card
                  className={`cursor-pointer transition-colors ${campaignStatusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setCampaignStatusFilter('all')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCampaigns}</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-colors ${campaignStatusFilter === 'enabled' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setCampaignStatusFilter(campaignStatusFilter === 'enabled' ? 'all' : 'enabled')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Enabled</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enabledCampaigns}</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-colors ${campaignStatusFilter === 'paused' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setCampaignStatusFilter(campaignStatusFilter === 'paused' ? 'all' : 'paused')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paused</CardTitle>
                    <PauseCircle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pausedCampaigns}</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-colors ${campaignStatusFilter === 'removed' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setCampaignStatusFilter(campaignStatusFilter === 'removed' ? 'all' : 'removed')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Removed</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{removedCampaigns}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button size="sm" className="h-9 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Campaign
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-blue-500" />
                            {campaign.campaign_name}
                          </div>
                        </TableCell>
                        <TableCell>{getAccountName(campaign.google_ads_account_id)}</TableCell>
                        <TableCell>{getWebsiteName(campaign.website_id)}</TableCell>
                        <TableCell>{getDomainName(campaign.domain_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={campaignTypeColor(campaign.campaign_type)}>
                            {campaign.campaign_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{campaign.budget_amount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">{campaign.currency}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={campaignStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.start_date}</TableCell>
                        <TableCell>{campaign.end_date || '-'}</TableCell>
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
                    {filteredCampaigns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                          No campaigns found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
