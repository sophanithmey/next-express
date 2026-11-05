'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/features/auth/types/auth-types';
import { Button } from '../atoms/button';
import { Avatar } from '../atoms/avatar';
import { Truck, PlusCircle, LayoutDashboard, LogIn } from 'lucide-react';

interface HomeHeaderProps {
  user: UserProfile | null;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const bookExpressHref = user ? '/bookings/new' : '/login?redirect=/bookings/new';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              WingExpress
            </span>
            <span className="text-[10px] text-brand-600 font-semibold tracking-wide uppercase">
              Wing Delivery Network
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                  Dashboard
                </Button>
              </Link>

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <Avatar name={user.name || 'Seller'} size="sm" />
                <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                  {user.shopName || user.name}
                </span>
              </div>

              <Link href={bookExpressHref}>
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Book Express
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                  Sign In
                </Button>
              </Link>

              <Link href={bookExpressHref}>
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Book Express
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
