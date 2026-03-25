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
import { useProviderMutations, ServiceProvider } from '@/hooks/use-providers';

const providerSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required'),
  providerType: z.enum(['registrar', 'hosting', 'cdn', 'ssl', 'other'], {
    required_error: 'Provider type is required',
  }),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
  apiEndpoint: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  provider?: ServiceProvider;
  mode: 'create' | 'edit';
}

export function ProviderForm({ provider, mode }: ProviderFormProps) {
  const router = useRouter();
  const { createProvider, updateProvider } = useProviderMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: provider
      ? {
          providerName: provider.providerName,
          providerType: provider.providerType as any,
          websiteUrl: provider.websiteUrl || '',
          supportEmail: provider.supportEmail || '',
          supportPhone: provider.supportPhone || '',
          apiEndpoint: provider.apiEndpoint || '',
          notes: provider.notes || '',
        }
      : {},
  });

  const onSubmit = async (data: ProviderFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        websiteUrl: data.websiteUrl || null,
        supportEmail: data.supportEmail || null,
        supportPhone: data.supportPhone || null,
        apiEndpoint: data.apiEndpoint || null,
        notes: data.notes || null,
      };

      if (mode === 'create') {
        await createProvider(submitData);
      } else if (provider) {
        await updateProvider(provider.id, submitData);
      }

      router.push('/providers');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create Service Provider' : 'Edit Service Provider'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="providerName">Provider Name *</Label>
              <Input
                id="providerName"
                placeholder="e.g., GoDaddy, AWS, Cloudflare"
                {...register('providerName')}
              />
              {errors.providerName && (
                <p className="text-sm text-red-600">{errors.providerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerType">Provider Type *</Label>
              <Select
                value={watch('providerType')}
                onValueChange={(value) => setValue('providerType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrar">Registrar</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                  <SelectItem value="cdn">CDN</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.providerType && (
                <p className="text-sm text-red-600">{errors.providerType.message}</p>
              )}
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
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@example.com"
                {...register('supportEmail')}
              />
              {errors.supportEmail && (
                <p className="text-sm text-red-600">{errors.supportEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('supportPhone')}
              />
              {errors.supportPhone && (
                <p className="text-sm text-red-600">{errors.supportPhone.message}</p>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this provider..."
              rows={4}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Provider'
              ) : (
                'Update Provider'
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
