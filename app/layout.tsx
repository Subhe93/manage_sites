import './globals.css';
import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';

export const metadata: Metadata = {
  title: 'DomainManager Pro',
  description: 'Professional domain, server, and website management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
