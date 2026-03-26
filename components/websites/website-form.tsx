'use client';

import { useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe, Server, Key, Link2, FileText, Plus, Trash2, LayoutTemplate, EyeOff, Eye, Copy } from 'lucide-react';
import { useWebsiteMutations, Website } from '@/hooks/use-websites';
import { useClients } from '@/hooks/use-clients';
import { useDomains } from '@/hooks/use-domains';
import { useServers } from '@/hooks/use-servers';
import {
  useGoogleAdsAccounts,
  useGoogleAnalyticsAccounts,
  useGoogleSearchConsoleAccounts,
  useGoogleTagManagerAccounts,
} from '@/hooks/use-google-services';

const websiteSchema = z.object({
  websiteName: z.string().min(3, 'Website name must be at least 3 characters'),
  domainId: z.number().int().positive().optional().nullable(),
  clientId: z.number().int().positive().optional().nullable(),
  serverId: z.number().int().positive().optional().nullable(),
  serverAccountId: z.number().int().positive().optional().nullable(),
  googleAdsAccountId: z.number().int().positive().optional().nullable(),
  googleAnalyticsAccountId: z.number().int().positive().optional().nullable(),
  googleSearchConsoleAccountId: z.number().int().positive().optional().nullable(),
  googleTagManagerAccountId: z.number().int().positive().optional().nullable(),
  websiteType: z.enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce'], {
    required_error: 'Website type is required',
  }),
  framework: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production'], {
    required_error: 'Environment is required',
  }),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  adminUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  adminUsername: z.string().optional(),
  adminPassword: z.string().optional(),
  apiEndpoint: z.string().url('Invalid URL').optional().or(z.literal('')),
  databaseName: z.string().optional(),
  databaseType: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived'], {
    required_error: 'Status is required',
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
  subdomains: z.array(z.object({
    id: z.number().optional(),
    subdomainName: z.string().min(1, 'Subdomain name is required'),
    fullUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    websiteType: z.enum(['wordpress', 'spa', 'custom', 'mobile_app', 'static', 'ecommerce']),
    framework: z.string().optional(),
    adminUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    adminUsername: z.string().optional(),
    adminPassword: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface WebsiteFormProps {
  website?: Website;
  mode: 'create' | 'edit';
}

const FormPasswordInput = forwardRef<HTMLInputElement, any>(({ onCopyValue, ...props }, ref) => {
  const [show, setShow] = useState(false);
  
  const handleCopy = () => {
    if (onCopyValue) {
      navigator.clipboard.writeText(onCopyValue);
      toast.success('Password copied!');
    }
  };

  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} ref={ref} {...props} className="pr-16" />
      <div className="absolute right-0 top-0 h-full flex items-center pr-2 gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(!show)}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
FormPasswordInput.displayName = 'FormPasswordInput';

export function WebsiteForm({ website, mode }: WebsiteFormProps) {
  const router = useRouter();
  const { createWebsite, updateWebsite } = useWebsiteMutations();
  const { clients } = useClients({ pageSize: 100 });
  const { domains } = useDomains({ pageSize: 100 });
  const { servers } = useServers({ pageSize: 100 });
  const { items: googleAdsAccounts } = useGoogleAdsAccounts();
  const { items: googleAnalyticsAccounts } = useGoogleAnalyticsAccounts();
  const { items: googleSearchConsoleAccounts } = useGoogleSearchConsoleAccounts();
  const { items: googleTagManagerAccounts } = useGoogleTagManagerAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: website
      ? {
          websiteName: website.websiteName,
          domainId: website.domainId,
          clientId: website.clientId,
          serverId: website.serverId,
          serverAccountId: website.serverAccountId,
          googleAdsAccountId: website.googleAdsAccountId,
          googleAnalyticsAccountId: website.googleAnalyticsAccountId,
          googleSearchConsoleAccountId: website.googleSearchConsoleAccountId,
          googleTagManagerAccountId: website.googleTagManagerAccountId,
          websiteType: website.websiteType as any,
          framework: website.framework || '',
          environment: website.environment as any,
          websiteUrl: website.websiteUrl || '',
          adminUrl: website.adminUrl || '',
          adminUsername: website.credentials?.find(c => c.credentialType === 'admin')?.username || '',
          adminPassword: website.credentials?.find(c => c.credentialType === 'admin')?.passwordEncrypted || '',
          apiEndpoint: website.apiEndpoint || '',
          databaseName: website.databaseName || '',
          databaseType: website.databaseType || '',
          status: website.status as any,
          description: website.description || '',
          notes: website.notes || '',
          subdomains: website.subdomains?.map(s => ({
            id: s.id,
            subdomainName: s.subdomainName,
            fullUrl: s.fullUrl || '',
            websiteType: s.websiteType as any,
            framework: s.framework || '',
            adminUrl: s.adminUrl || '',
            adminUsername: s.adminUsername || '',
            adminPassword: s.adminPassword || '',
            notes: s.notes || '',
          })) || [],
        }
      : {
          status: 'active',
          environment: 'production',
          websiteType: 'wordpress',
          subdomains: [],
        },
  });

  const { fields: subdomainFields, append: appendSubdomain, remove: removeSubdomain } = useFieldArray({
    control,
    name: "subdomains",
  });

  const onSubmit = async (data: WebsiteFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        domainId: data.domainId ?? null,
        clientId: data.clientId ?? null,
        serverId: data.serverId ?? null,
        serverAccountId: data.serverAccountId ?? null,
        googleAdsAccountId: data.googleAdsAccountId ?? null,
        googleAnalyticsAccountId: data.googleAnalyticsAccountId ?? null,
        googleSearchConsoleAccountId: data.googleSearchConsoleAccountId ?? null,
        googleTagManagerAccountId: data.googleTagManagerAccountId ?? null,
        framework: data.framework || undefined,
        websiteUrl: data.websiteUrl || undefined,
        adminUrl: data.adminUrl || undefined,
        adminUsername: data.adminUsername || undefined,
        adminPassword: data.adminPassword || undefined,
        apiEndpoint: data.apiEndpoint || undefined,
        databaseName: data.databaseName || undefined,
        databaseType: data.databaseType || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
        subdomains: data.subdomains?.map(sub => ({
          ...sub,
          fullUrl: sub.fullUrl || null,
          framework: sub.framework || null,
          adminUrl: sub.adminUrl || null,
          adminUsername: sub.adminUsername || null,
          adminPassword: sub.adminPassword || null,
          notes: sub.notes || null,
        })),
      };

      if (mode === 'create') {
        await createWebsite(submitData);
      } else if (website) {
        await updateWebsite(website.id, submitData);
      }

      router.push('/websites');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Website' : 'Edit Website'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-8">
            {/* Section 1: General Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="websiteName">Website Name *</Label>
                  <Input
                    id="websiteName"
                    placeholder="e.g., My Company Website"
                    {...register('websiteName')}
                  />
                  {errors.websiteName && (
                    <p className="text-sm text-red-600">{errors.websiteName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select
                    value={watch('clientId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('clientId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domainId">Domain</Label>
                  <Select
                    value={watch('domainId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('domainId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Domain</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id.toString()}>
                          {domain.domainName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverId">Server</Label>
                  <Select
                    value={watch('serverId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('serverId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select server" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Server</SelectItem>
                      {servers.map((server) => (
                        <SelectItem key={server.id} value={server.id.toString()}>
                          {server.serverName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Technical Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Technical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="websiteType">Website Type *</Label>
                  <Select
                    value={watch('websiteType')}
                    onValueChange={(value) => setValue('websiteType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select website type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wordpress">WordPress</SelectItem>
                      <SelectItem value="spa">SPA</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="mobile_app">Mobile App</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.websiteType && (
                    <p className="text-sm text-red-600">{errors.websiteType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">Environment *</Label>
                  <Select
                    value={watch('environment')}
                    onValueChange={(value) => setValue('environment', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.environment && (
                    <p className="text-sm text-red-600">{errors.environment.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Input
                    id="framework"
                    placeholder="e.g., Next.js, Laravel, React"
                    {...register('framework')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    type="url"
                    placeholder="https://api.example.com"
                    {...register('apiEndpoint')}
                  />
                  {errors.apiEndpoint && (
                    <p className="text-sm text-red-600">{errors.apiEndpoint.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="databaseName">Database Name</Label>
                  <Input
                    id="databaseName"
                    placeholder="e.g., mysite_db"
                    {...register('databaseName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="databaseType">Database Type</Label>
                  <Select
                    value={watch('databaseType') || 'none'}
                    onValueChange={(value) =>
                      setValue('databaseType', value === 'none' ? '' : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                      <SelectItem value="mariadb">MariaDB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Login & Access */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Login & Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    {...register('websiteUrl')}
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-red-600">{errors.websiteUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminUrl">Admin URL</Label>
                  <Input
                    id="adminUrl"
                    type="url"
                    placeholder="https://example.com/admin"
                    {...register('adminUrl')}
                  />
                  {errors.adminUrl && (
                    <p className="text-sm text-red-600">{errors.adminUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminUsername">Admin Username / Email</Label>
                  <Input
                    id="adminUsername"
                    autoComplete="off"
                    placeholder="Admin username or email"
                    {...register('adminUsername')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <FormPasswordInput
                    id="adminPassword"
                    autoComplete="new-password"
                    placeholder="Admin password"
                    onCopyValue={watch('adminPassword')}
                    {...register('adminPassword')}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Integrations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Google Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsAccountId">Analytics Account</Label>
                  <Select
                    value={watch('googleAnalyticsAccountId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('googleAnalyticsAccountId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Analytics account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {googleAnalyticsAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleSearchConsoleAccountId">Search Console Account</Label>
                  <Select
                    value={watch('googleSearchConsoleAccountId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('googleSearchConsoleAccountId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Search Console account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {googleSearchConsoleAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleAdsAccountId">Ads Account</Label>
                  <Select
                    value={watch('googleAdsAccountId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('googleAdsAccountId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ads account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {googleAdsAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleTagManagerAccountId">Tag Manager Account</Label>
                  <Select
                    value={watch('googleTagManagerAccountId')?.toString() || 'none'}
                    onValueChange={(value) =>
                      setValue('googleTagManagerAccountId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tag Manager account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {googleTagManagerAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 5: Subdomains */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                  Subdomains
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSubdomain({
                    subdomainName: '',
                    fullUrl: '',
                    websiteType: 'wordpress',
                    framework: '',
                    adminUrl: '',
                    adminUsername: '',
                    adminPassword: '',
                    notes: '',
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subdomain
                </Button>
              </div>

              {subdomainFields.length === 0 ? (
                <div className="text-center p-6 border rounded-lg border-dashed bg-muted/20 text-muted-foreground">
                  No subdomains added yet. Click &quot;Add Subdomain&quot; to begin.
                </div>
              ) : (
                <div className="space-y-6">
                  {subdomainFields.map((field, index) => (
                    <div key={field.id} className="p-5 border rounded-lg relative bg-card shadow-sm">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 h-8 w-8"
                        onClick={() => removeSubdomain(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                        <div className="space-y-2">
                          <Label>Subdomain Name *</Label>
                          <Input
                            placeholder="e.g., blog"
                            {...register(`subdomains.${index}.subdomainName`)}
                          />
                          {errors.subdomains?.[index]?.subdomainName && (
                            <p className="text-sm text-red-600">{errors.subdomains[index].subdomainName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Full URL</Label>
                          <Input
                            type="url"
                            placeholder="https://blog.example.com"
                            {...register(`subdomains.${index}.fullUrl`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Website Type *</Label>
                          <Select
                            value={watch(`subdomains.${index}.websiteType`)}
                            onValueChange={(value) => setValue(`subdomains.${index}.websiteType`, value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wordpress">WordPress</SelectItem>
                              <SelectItem value="spa">SPA</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                              <SelectItem value="static">Static</SelectItem>
                              <SelectItem value="mobile_app">Mobile App</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Framework</Label>
                          <Input
                            placeholder="e.g., Next.js, Laravel"
                            {...register(`subdomains.${index}.framework`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Admin URL</Label>
                          <Input
                            type="url"
                            placeholder="https://blog.example.com/admin"
                            {...register(`subdomains.${index}.adminUrl`)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Admin Username</Label>
                            <Input
                              autoComplete="off"
                              placeholder="Username"
                              {...register(`subdomains.${index}.adminUsername`)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Admin Password</Label>
                            <FormPasswordInput
                              autoComplete="new-password"
                              placeholder="Password"
                              onCopyValue={watch(`subdomains.${index}.adminPassword`)}
                              {...register(`subdomains.${index}.adminPassword`)}
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 6: Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the website..."
                    rows={3}
                    {...register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    rows={3}
                    {...register('notes')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Website'
              ) : (
                'Update Website'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
