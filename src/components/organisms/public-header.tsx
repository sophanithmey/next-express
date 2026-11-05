'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, User } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

export function PublicHeader() {
  const { isAuthenticated, user } = useAuthState();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Express<span className="text-brand-600">Seller</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/bookings"
                className="hidden sm:block text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Bookings
              </Link>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {user?.shopName || user?.name || 'My Shop'}
                </span>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700 transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
