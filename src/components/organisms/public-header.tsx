'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, User, LogOut, LayoutDashboard, History } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

export function PublicHeader() {
  const { isAuthenticated, user, logout } = useAuthState();

  return (
    <header className='sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xs'>
      <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6'>
        {/* Brand */}
        <Link href='/' className='flex items-center gap-2 group'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:bg-brand-700 transition'>
            <Truck className='h-4.5 w-4.5' />
          </div>
          <div>
            <span className='text-sm font-bold text-slate-900 tracking-tight block leading-tight'>
              Express<span className='text-brand-600'>Seller</span>
            </span>
            <span className='text-[9px] text-slate-400 font-semibold tracking-wider uppercase hidden sm:block'>
              Express Delivery Platform
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className='flex items-center gap-2 sm:gap-3'>
          {isAuthenticated ? (
            <>
              <Link
                href='/dashboard'
                className='flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition'
              >
                <LayoutDashboard className='h-3.5 w-3.5' />
                <span>Dashboard</span>
              </Link>
              <Link
                href='/bookings'
                className='hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition'
              >
                <History className='h-3.5 w-3.5' />
                <span>Bookings</span>
              </Link>

              <div className='flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 sm:px-3 sm:py-1.5'>
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold'>
                  {user?.shopName?.[0] || user?.name?.[0] || 'M'}
                </div>
                <span className='text-xs font-medium text-slate-700 max-w-[120px] truncate'>
                  {user?.shopName || user?.name || 'Seller'}
                </span>
              </div>

              <button
                type='button'
                onClick={logout}
                title='Sign Out'
                className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition'
                aria-label='Sign Out'
              >
                <LogOut className='h-4 w-4' />
              </button>
            </>
          ) : (
            <Link
              href='/login'
              className='flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-brand-300 hover:text-brand-600 transition'
            >
              <User className='h-3.5 w-3.5' />
              <span>Merchant Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
