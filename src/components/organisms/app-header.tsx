'use client';

import React from 'react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { Avatar } from '../atoms/avatar';
import { Bell, LogOut, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AppHeaderProps {
  user: UserProfile | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              Express Seller
            </span>
            <span className="text-[10px] text-brand-600 font-semibold tracking-wide uppercase">
              Wing Delivery Network
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <Avatar name={user?.name || 'Seller'} size="md" />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-snug">
              {user?.shopName || user?.name || 'My Store'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {user?.phoneNumber || '+855 12 888 999'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
