'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ScanLine,
  ClipboardList,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/partner',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendar',
    href: '/partner/calendar',
    icon: Calendar,
  },
  {
    label: 'Scanner',
    href: '/partner/scanner',
    icon: ScanLine,
  },
  {
    label: 'Attendance',
    href: '/partner/attendance',
    icon: ClipboardList,
  },
  {
    label: 'Analytics',
    href: '/partner/analytics',
    icon: BarChart3,
  },
  {
    label: 'Earnings',
    href: '/partner/earnings',
    icon: DollarSign,
  },
  {
    label: 'Settings',
    href: '/partner/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-card"
      >
        <Menu className="w-6 h-6 text-deep-play-blue" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-deep-play-blue text-white z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!isCollapsed && (
            <Link href="/partner" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-adventure-orange flex items-center justify-center">
                <span className="text-white font-bold text-sm">KV</span>
              </div>
              <span className="font-display text-xl">KidVenture</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-explorer-teal text-white shadow-glow-teal'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {!isCollapsed && user && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={signOut}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
              'text-white/70 hover:bg-white/10 hover:text-white transition-colors'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
