'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'New Delivery',
      href: '/bookings/new',
      icon: PlusCircle,
      active: pathname === '/bookings/new',
      highlight: true,
    },
    {
      label: 'Booking History',
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
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-slate-200 md:bg-white md:p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                item.active
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                item.highlight && !item.active
                  ? 'bg-brand-600 text-white hover:bg-brand-700 hover:text-white shadow-xs'
                  : ''
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-200">
          <p className="font-semibold text-slate-800">Fast Booking Tip</p>
          <p className="mt-1 text-[11px] leading-relaxed">
            Reuse previous drop-offs from Booking History by clicking &ldquo;Book Again&rdquo;!
          </p>
        </div>
      </div>
    </aside>
  );
}

