'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/features/auth/types/auth-types';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import {
  Truck,
  Plus,
  LayoutDashboard,
  History,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface AppHeaderProps {
  user: UserProfile | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      label: 'New Delivery',
      href: '/',
      icon: Plus,
      highlight: true,
      active: pathname === '/' || pathname === '/bookings/new',
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'My Bookings',
      href: '/bookings',
      icon: History,
      active: pathname === '/bookings' || (pathname.startsWith('/bookings/') && pathname !== '/bookings/new'),
    },
    {
      label: 'Saved Recipients',
      href: '/recipients',
      icon: Users,
      active: pathname === '/recipients',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:bg-brand-700 transition">
            <Truck className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">
              Express<span className="text-brand-600">Seller</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
              Book your delivery in seconds.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  item.active
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  item.highlight && !item.active
                    ? 'bg-brand-600 text-white hover:bg-brand-700 hover:text-white shadow-2xs'
                    : ''
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Account & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
              {user?.shopName?.[0] || user?.name?.[0] || 'S'}
            </div>
            <span className="font-semibold text-slate-800 max-w-[120px] truncate hidden sm:inline">
              {user?.shopName || user?.name || 'Seller Store'}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-3 space-y-1 animate-in fade-in">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition',
                  item.active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
