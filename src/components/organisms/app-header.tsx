'use client';

import React, { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Truck, Package, LogIn, ArrowRight, Home, Menu, X } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { UserProfile } from '@/features/auth/types/auth-types';
import { LogoutConfirmModal } from '@/components/molecules/logout-confirm-modal';
import { LanguageSwitcher } from '@/components/molecules/language-switcher';
import { AppHeaderMobileDrawer } from '@/components/molecules/app-header-mobile-drawer';
import { AppHeaderUserMenu } from '@/components/molecules/app-header-user-menu';

interface AppHeaderProps {
  user?: UserProfile | null;
}

export function AppHeader({ user: propUser }: AppHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const { isAuthenticated: authContextIsAuth, user: contextUser, logout, openAuthModal } = useAuthState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const user = contextUser || propUser;
  const isAuthenticated = authContextIsAuth || Boolean(user);

  if (pathname === '/login' || pathname === '/verify-pin') {
    return null;
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {/* Floating Apple-style Frosted Glass Island Header */}
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-2 sm:pt-3 pb-2 transition-all">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl sm:rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-2xl backdrop-saturate-200 px-3.5 sm:px-5 shadow-[0_8px_30px_rgb(0,0,0,0.06),0_1px_3px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
          {/* Brand Logo with Wing Blue & Gold Accent */}
          <Link href="/" prefetch={true} className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-2xs group-hover:scale-105 transition-transform ring-1 ring-secondary-500/20">
              <Truck className="h-4.5 w-4.5 text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
                  Wing<span className="text-secondary-600">Express</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
                {t('sellerHub')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/70 border border-slate-200/50">
              <Link
                href="/"
                prefetch={true}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                  pathname === '/'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>{t('home')}</span>
              </Link>

              {isAuthenticated ? (
                <Link
                  href="/bookings"
                  prefetch={true}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                    pathname.startsWith('/bookings')
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>{t('myBookings')}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all cursor-pointer"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>{t('myBookings')}</span>
                </button>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200/80 mx-1" />

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-600" />
                <span>{t('login')}</span>
              </button>
            )}

            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <AppHeaderUserMenu
                user={user}
                onOpenLogoutModal={() => setShowLogoutModal(true)}
              />
            ) : null}

            <Link
              href="/booking"
              prefetch={true}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-secondary-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-secondary-700 hover:shadow-sm active:scale-95 transition-all shrink-0"
            >
              <span>{t('bookDelivery')}</span>
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </Link>
          </nav>

          {/* Mobile Right Controls: Book CTA & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/booking"
              prefetch={true}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-secondary-600 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-secondary-700 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <span>{t('bookDelivery')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 shadow-2xs backdrop-blur-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation with Apple-style Frosted Glass */}
      <AppHeaderMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onOpenAuthModal={openAuthModal}
        onOpenLogoutModal={() => setShowLogoutModal(true)}
      />

      {/* Logout Confirmation Dialog Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
