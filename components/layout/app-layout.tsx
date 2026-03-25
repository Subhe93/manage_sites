'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./sidebar').then(m => ({ default: m.Sidebar })), { ssr: false });

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

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
