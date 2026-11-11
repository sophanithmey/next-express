'use client';

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Home, Package, LogIn, LogOut, ArrowRight, Check } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { formatPhoneNumber } from '@/lib/phone-number';

interface AppHeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user?: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenLogoutModal: () => void;
}

export function AppHeaderMobileDrawer({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onOpenAuthModal,
  onOpenLogoutModal,
}: AppHeaderMobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Navigation');

  if (!isOpen) return null;

  const handleLanguageSwitch = (newLocale: 'km' | 'en') => {
    if (newLocale === locale) return;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`${pathname}${search}`, { locale: newLocale });
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Glass Island Card */}
      <div className="md:hidden fixed inset-x-3 top-18 z-50 rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl p-4.5 ring-1 ring-black/5 animate-in slide-in-from-top-3 fade-in duration-200 max-h-[calc(100vh-5.5rem)] overflow-y-auto space-y-4">
        {/* Navigation Tabs */}
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

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Language Segmented Control */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Language / ភាសា
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('km')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                locale === 'km'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">🇰🇭</span>
              <span>ខ្មែរ</span>
              {locale === 'km' && <Check className="h-3.5 w-3.5 text-secondary-600" />}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                locale === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">🇬🇧</span>
              <span>English</span>
              {locale === 'en' && <Check className="h-3.5 w-3.5 text-secondary-600" />}
            </button>
          </div>
        </div>

        {/* User Account / Auth Section */}
        <div className="pt-1">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-white font-black uppercase text-sm shadow-xs">
                  {user?.shopName?.[0] || user?.name?.[0] || 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.shopName || user?.name || 'Seller Store'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatPhoneNumber(user?.phoneNumber || '012888999')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogoutModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-danger-600 hover:bg-danger-50 transition cursor-pointer border border-danger-200/60 bg-white"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200/80 bg-white text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-slate-600" />
              <span>{t('login')}</span>
            </button>
          )}
        </div>

        {/* Primary CTA */}
        <div className="pt-1">
          <Link
            href="/booking"
            onClick={onClose}
            prefetch={true}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-secondary-600 hover:bg-secondary-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <span>{t('bookDelivery')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
