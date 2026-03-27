'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./sidebar').then(m => ({ default: m.Sidebar })), { ssr: false });

const NO_LAYOUT_PATHS = ['/login'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isNoLayout = NO_LAYOUT_PATHS.includes(pathname);

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  if (isNoLayout) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main 
        className="transition-all duration-300"
        style={{ 
          paddingLeft: sidebarCollapsed ? '68px' : '260px' 
        }}
      >
        {children}
      </main>
    </div>
  );
}
