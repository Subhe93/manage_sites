'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Globe, Server, Monitor, Users, Building2, Cloud, ChartBar as BarChart3, Search, Bell, Activity, Settings, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, UserCog, Lock, LogOut, Upload } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Overview', href: '/overview', icon: Search },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Domains', href: '/domains', icon: Globe },
  { label: 'Servers', href: '/servers', icon: Server },
  { label: 'Websites', href: '/websites', icon: Monitor },
  { label: 'Service Providers', href: '/providers', icon: Building2 },
  {
    label: 'Cloudflare',
    href: '/cloudflare',
    icon: Cloud,
    children: [
      { label: 'Accounts', href: '/cloudflare/accounts' },
    ],
  },
  {
    label: 'Google Services',
    href: '/google',
    icon: BarChart3,
    children: [
      { label: 'Ads Accounts', href: '/google/ads' },
      { label: 'Analytics', href: '/google/analytics' },
      { label: 'Search Console', href: '/google/search-console' },
      { label: 'Tag Manager', href: '/google/tag-manager' },
    ],
  },
  { label: 'Uptime Monitor', href: '/uptime', icon: Activity },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Activity Log', href: '/activity', icon: Search },
  { label: 'Users', href: '/users', icon: UserCog },
  { label: 'Permissions', href: '/permissions', icon: Lock },
  { label: 'Import Data', href: '/import', icon: Upload },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { label: 'General', href: '/settings' },
      { label: 'Custom Fields', href: '/settings/custom-fields' },
      { label: 'Uptime Monitor', href: '/settings/uptime-monitor' },
    ],
  },
];

interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { canViewSection, isAdmin } = useUserPermissions();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Dispatch custom event to notify AppLayout
    window.dispatchEvent(
      new CustomEvent('sidebar-toggle', {
        detail: { collapsed: newCollapsedState }
      })
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // 🔐 Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter((item) => {
    // Always show Dashboard, Overview, Settings
    if (['/', '/overview', '/settings'].some(path => item.href === path)) {
      return true;
    }

    // Map sections to permission entities
    const sectionMap: Record<string, string> = {
      '/clients': 'clients',
      '/domains': 'domains',
      '/servers': 'servers',
      '/websites': 'websites',
      '/providers': 'providers',
      '/cloudflare': 'cloudflare',
      '/google': 'google',
      '/uptime': 'uptime',
      '/notifications': 'notifications',
      '/activity': 'activity',
    };

    // Show admin-only sections only to admins
    if (['/users', '/permissions', '/import'].some(path => item.href === path)) {
      return isAdmin;
    }

    // Check if section is allowed
    const section = sectionMap[item.href];
    if (section) {
      return canViewSection(section);
    }

    return true;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300',
        'bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] border-[hsl(var(--sidebar-border))]',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-[hsl(var(--sidebar-border))]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Globe className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">DomainManager</h1>
              <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-60">Pro Dashboard</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] mx-auto">
            <Globe className="h-4.5 w-4.5 text-white" />
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
      </button>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5">
        <div className="space-y-0.5">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isExpanded = expandedItems.includes(item.label);

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => !collapsed && toggleExpand(item.label)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                      'hover:bg-[hsl(var(--sidebar-accent))] hover:text-white',
                      active && 'bg-[hsl(var(--sidebar-accent))] text-white'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="ml-[30px] mt-0.5 space-y-0.5 border-l border-[hsl(var(--sidebar-border))] pl-2.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150',
                            'hover:bg-[hsl(var(--sidebar-accent))] hover:text-white',
                            pathname === child.href && 'bg-[hsl(var(--sidebar-accent))] text-white'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                  'hover:bg-[hsl(var(--sidebar-accent))] hover:text-white',
                  active && 'bg-[hsl(var(--sidebar-accent))] text-white font-medium'
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
        <div className="flex items-center gap-2.5">
          {!collapsed && user && (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-xs font-medium text-white shrink-0">
                {(user.fullName || user.username).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.fullName || user.username}</p>
                <p className="text-[10px] opacity-60 truncate">{user.role.replace('_', ' ')}</p>
              </div>
            </>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className={cn(
              'flex items-center justify-center rounded-lg p-2 transition-colors',
              'hover:bg-destructive/20 text-[hsl(var(--sidebar-foreground))] hover:text-destructive',
              collapsed && 'mx-auto'
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
