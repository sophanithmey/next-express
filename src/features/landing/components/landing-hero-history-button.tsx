'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

export function LandingHeroHistoryButton() {
  const t = useTranslations('Home');
  const { isAuthenticated, openAuthModal } = useAuthState();
  const router = useRouter();

  const handleViewDeliveries = () => {
    if (isAuthenticated) {
      router.push('/bookings');
    } else {
      openAuthModal(() => {
        router.push('/bookings');
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleViewDeliveries}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer active:scale-[0.99]"
    >
      <Package className="h-4 w-4 text-slate-500" />
      <span>{t('ctaHistory')}</span>
    </button>
  );
}
