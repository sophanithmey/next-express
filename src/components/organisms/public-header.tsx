'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, LogOut, History, User } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

interface PublicHeaderProps {
  onOpenAuthModal?: () => void;
}

export function PublicHeader({ onOpenAuthModal }: PublicHeaderProps) {
  const { isAuthenticated, user, logout } = useAuthState();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo & Description */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:bg-brand-700 transition">
            <Truck className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">
              Wing<span className="text-yellow-500">Express</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
              Book your delivery in seconds.
            </span>
          </div>
        </Link>

        {/* Navigation & Auth */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/bookings"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <History className="h-3.5 w-3.5 text-slate-500" />
                <span>My Bookings</span>
              </Link>

              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                  {user?.shopName?.[0] || user?.name?.[0] || 'S'}
                </div>
                <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                  {user?.shopName || user?.name || 'Seller'}
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1"
              >
                My Bookings
              </button>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-brand-400 hover:text-brand-600 transition"
              >
                <User className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
