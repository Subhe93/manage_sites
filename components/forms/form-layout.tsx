'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface FormLayoutProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export function FormLayout({ title, description, backHref, backLabel, onSubmit, children }: FormLayoutProps) {
  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="max-w-4xl space-y-6">
            {children}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Link href={backHref}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function FormFieldWrapper({ label, required, fullWidth, children }: FormFieldWrapperProps) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <label className="text-sm font-medium text-foreground block mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
