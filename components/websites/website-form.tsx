'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
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
  apiEndpoint: z.string().url('Invalid URL').optional().or(z.literal('')),
  databaseName: z.string().optional(),
  databaseType: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'suspended', 'archived'], {
    required_error: 'Status is required',
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface WebsiteFormProps {
  website?: Website;
  mode: 'create' | 'edit';
}

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
  } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: website
      ? {
          websiteName: website.websiteName,
          domainId: website.domainId,
          clientId: website.clientId,
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
          apiEndpoint: website.apiEndpoint || '',
          databaseName: website.databaseName || '',
          databaseType: website.databaseType || '',
          status: website.status as any,
          description: website.description || '',
          notes: website.notes || '',
        }
      : {
          status: 'active',
          environment: 'production',
          websiteType: 'wordpress',
        },
  });

  const onSubmit = async (data: WebsiteFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        domainId: data.domainId ?? null,
        clientId: data.clientId ?? null,
        serverAccountId: data.serverAccountId ?? null,
        googleAdsAccountId: data.googleAdsAccountId ?? null,
        googleAnalyticsAccountId: data.googleAnalyticsAccountId ?? null,
        googleSearchConsoleAccountId: data.googleSearchConsoleAccountId ?? null,
        googleTagManagerAccountId: data.googleTagManagerAccountId ?? null,
        framework: data.framework || undefined,
        websiteUrl: data.websiteUrl || undefined,
        adminUrl: data.adminUrl || undefined,
        apiEndpoint: data.apiEndpoint || undefined,
        databaseName: data.databaseName || undefined,
        databaseType: data.databaseType || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
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
              <Label htmlFor="googleAdsAccountId">Ads Account (Optional)</Label>
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
              <Label htmlFor="googleAnalyticsAccountId">Analytics Account (Optional)</Label>
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
              <Label htmlFor="googleSearchConsoleAccountId">Search Console Account (Optional)</Label>
              <Select
                value={watch('googleSearchConsoleAccountId')?.toString() || 'none'}
                onValueChange={(value) =>
                  setValue(
                    'googleSearchConsoleAccountId',
                    value === 'none' ? null : parseInt(value)
                  )
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
              <Label htmlFor="googleTagManagerAccountId">Tag Manager Account (Optional)</Label>
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
              <Label htmlFor="serverAccountId">Server</Label>
              <Select
                value={watch('serverAccountId')?.toString() || 'none'}
                onValueChange={(value) =>
                  setValue('serverAccountId', value === 'none' ? null : parseInt(value))
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
              <Label htmlFor="framework">Framework</Label>
              <Input
                id="framework"
                placeholder="e.g., Next.js, Laravel, React"
                {...register('framework')}
              />
            </div>

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
