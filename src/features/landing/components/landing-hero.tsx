'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, Package, CheckCircle2, Banknote } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

export function LandingHero() {
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
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Headline, Copy, Action Buttons */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-800">
            <span className="flex h-2 w-2 rounded-full bg-secondary-600 animate-pulse" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-snug lg:leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="mx-auto lg:mx-0 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/booking"
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-secondary-700 hover:shadow-lg transition active:scale-[0.99]"
            >
              <span>{t('ctaBook')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={handleViewDeliveries}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer active:scale-[0.99]"
            >
              <Package className="h-4 w-4 text-slate-500" />
              <span>{t('ctaHistory')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" /> {t('trustNoRegister')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" /> {t('trustPayment')}
            </span>
          </div>
        </div>

        {/* Right Column: Clean Logistics Product UI Preview */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('previewTitle')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700 border border-success-200">
                <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
                {t('previewLiveBadge')}
              </span>
            </div>

            {/* Route Diagram */}
            <div className="relative space-y-3 text-xs pl-1">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-secondary-600 font-bold font-mono text-[11px]">
                  A
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {t('previewPickupLabel')}
                  </span>
                  <p className="font-semibold text-slate-900 truncate">
                    {t('previewPickupAddress')}
                  </p>
                </div>
              </div>

              <div className="ml-3 h-4 border-l-2 border-dashed border-slate-200" />

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold font-mono text-[11px]">
                  B
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {t('previewDropoffLabel')}
                  </span>
                  <p className="font-semibold text-slate-900 truncate">
                    {t('previewDropoffAddress')}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Pricing Breakdown Snippet */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {t('previewEstimatedFee')}
                </span>
                <span className="font-mono text-lg font-bold text-slate-900">
                  {t('previewFeeAmount')}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-900 border border-primary-200">
                  <Banknote className="h-3 w-3 text-primary-700" />
                  {t('previewCodBadge')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {t('previewCodSub')}
                </span>
              </div>
            </div>

            <div className="pt-1 text-center">
              <Link
                href="/booking"
                prefetch={true}
                className="text-xs font-semibold text-secondary-600 hover:text-secondary-700 hover:underline inline-flex items-center gap-1"
              >
                <span>{t('previewLaunchForm')}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
