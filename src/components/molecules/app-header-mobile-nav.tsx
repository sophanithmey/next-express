'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, Package } from 'lucide-react';

interface AppHeaderMobileNavProps {
  pathname: string;
  isAuthenticated: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export function AppHeaderMobileNav({
  pathname,
  isAuthenticated,
  onClose,
  onOpenAuthModal,
}: AppHeaderMobileNavProps) {
  const t = useTranslations('Navigation');

  return (
    <nav className="space-y-1">
      <Link
        href="/"
        onClick={onClose}
        className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
          pathname === '/'
            ? 'bg-secondary-50 text-secondary-900 border border-secondary-200/70 shadow-2xs'
            : 'text-slate-700 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Home className="h-4 w-4" />
        </div>
        <span className="text-sm">{t('home')}</span>
      </Link>

      {isAuthenticated ? (
        <Link
          href="/bookings"
          onClick={onClose}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
            pathname.startsWith('/bookings')
              ? 'bg-secondary-50 text-secondary-900 border border-secondary-200/70 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-sm">{t('myBookings')}</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAuthModal();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100/70 transition-all cursor-pointer text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-sm">{t('myBookings')}</span>
        </button>
      )}
    </nav>
  );
}
