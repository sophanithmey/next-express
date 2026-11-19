'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { useMobileDrawer } from '@/hooks/use-mobile-drawer';
import { AppHeaderMobileNav } from './app-header-mobile-nav';
import { AppHeaderMobileLanguage } from './app-header-mobile-language';
import { AppHeaderMobileAuth } from './app-header-mobile-auth';

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
  const t = useTranslations('Navigation');
  const { pathname, locale, handleLanguageSwitch } = useMobileDrawer({ onClose });

  if (!isOpen) return null;

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
        <AppHeaderMobileNav
          pathname={pathname}
          isAuthenticated={isAuthenticated}
          onClose={onClose}
          onOpenAuthModal={onOpenAuthModal}
        />

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Language Segmented Control */}
        <AppHeaderMobileLanguage
          locale={locale}
          onSwitchLanguage={handleLanguageSwitch}
        />

        {/* User Account / Auth Section */}
        <AppHeaderMobileAuth
          isAuthenticated={isAuthenticated}
          user={user}
          onClose={onClose}
          onOpenAuthModal={onOpenAuthModal}
          onOpenLogoutModal={onOpenLogoutModal}
        />

        {/* Primary CTA */}
        <div className="pt-1">
          <Link
            href="/booking"
            onClick={onClose}
            prefetch={true}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            <span>{t('bookDelivery')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
