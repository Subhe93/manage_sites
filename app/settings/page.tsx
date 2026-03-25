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
import { Settings, Search, MoveHorizontal as MoreHorizontal, CreditCard as Edit, Eye, Bell, Server, CircleCheck as CheckCircle2, Circle as XCircle, Mail, Smartphone, MonitorSmartphone, Cog } from 'lucide-react';
import { mockSystemSettings, mockNotificationSettings, mockUsers } from '@/lib/mock-data';

function getSettingTypeBadgeClass(settingType: string): string {
  switch (settingType) {
    case 'string':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'number':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'boolean':
      return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    case 'json':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

function getNotificationTypeBadgeClass(notificationType: string): string {
  switch (notificationType) {
    case 'domain_expiry':
    case 'ssl_expiry':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'server_down':
    case 'security_alert':
    case 'backup_failed':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'server_billing':
    case 'website_billing':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'resource_limit':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

function getUserName(userId: number | null): string {
  if (userId === null) return 'System';
  const user = mockUsers.find((u) => u.id === userId);
  return user ? user.full_name : 'System';
}

const settingGroups = mockSystemSettings.reduce(
  (acc, setting) => {
    const type = setting.setting_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(setting);
    return acc;
  },
  {} as Record<string, typeof mockSystemSettings>
);

export default function SettingsPage() {
  const [systemSearch, setSystemSearch] = useState('');

  const filteredSettings = mockSystemSettings.filter(
    (s) =>
      s.setting_key.toLowerCase().includes(systemSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(systemSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure system settings and notification preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Cog className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSystemSettings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Public</CardTitle>
                  <Eye className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockSystemSettings.filter((s) => s.is_public).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Private</CardTitle>
                  <Settings className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockSystemSettings.filter((s) => !s.is_public).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Setting Types</CardTitle>
                  <Cog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(settingGroups).length}</div>
                </CardContent>
              </Card>
            </div>

            {Object.entries(settingGroups).map(([type, settings]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Badge variant="outline" className={getSettingTypeBadgeClass(type)}>
                      {type}
                    </Badge>
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {settings.map((setting) => (
                      <Card key={setting.id} className="border-dashed">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono font-medium">
                              {setting.setting_key}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={getSettingTypeBadgeClass(setting.setting_type)}
                              >
                                {setting.setting_type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  setting.is_public
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }
                              >
                                {setting.is_public ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-lg font-semibold">{setting.setting_value}</div>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockNotificationSettings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enabled</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockNotificationSettings.filter((n) => n.is_enabled).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Active</CardTitle>
                  <Mail className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockNotificationSettings.filter((n) => n.notify_via_email).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SMS Active</CardTitle>
                  <Smartphone className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockNotificationSettings.filter((n) => n.notify_via_sms).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Notification Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Notification Type</TableHead>
                      <TableHead>Days Before</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>SMS</TableHead>
                      <TableHead>In-App</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNotificationSettings.map((ns) => (
                      <TableRow key={ns.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getNotificationTypeBadgeClass(ns.notification_type)}
                          >
                            {ns.notification_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{ns.days_before}</TableCell>
                        <TableCell>
                          {ns.notify_via_email ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {ns.notify_via_sms ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {ns.notify_in_app ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ns.is_enabled
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }
                          >
                            {ns.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSystemSettings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">String</CardTitle>
                  <Settings className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockSystemSettings.filter((s) => s.setting_type === 'string').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Number</CardTitle>
                  <Settings className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockSystemSettings.filter((s) => s.setting_type === 'number').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Boolean</CardTitle>
                  <Settings className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockSystemSettings.filter((s) => s.setting_type === 'boolean').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search settings..."
                      value={systemSearch}
                      onChange={(e) => setSystemSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Is Public</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSettings.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {setting.setting_key}
                        </TableCell>
                        <TableCell className="font-semibold">{setting.setting_value}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getSettingTypeBadgeClass(setting.setting_type)}
                          >
                            {setting.setting_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {setting.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              setting.is_public
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }
                          >
                            {setting.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getUserName(setting.updated_by)}</TableCell>
                        <TableCell>{setting.created_at}</TableCell>
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
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSettings.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground py-8"
                        >
                          No settings found.
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
