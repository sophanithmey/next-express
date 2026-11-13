'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Truck, ShieldCheck, Banknote } from 'lucide-react';
import { LandingFooterPaymentMethods } from './landing-footer-payment-methods';

export function LandingFooterBrand() {
  const t = useTranslations('Footer');

  return (
    <div className="md:col-span-1 lg:col-span-4 space-y-4">
      {/* Brand Identity */}
      <Link href="/" prefetch={true} className="inline-flex items-center gap-2.5 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-2xs group-hover:scale-105 transition-transform ring-1 ring-secondary-500/20">
          <Truck className="h-4.5 w-4.5 text-primary-400" />
        </div>
        <div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
            Wing<span className="text-secondary-600">Express</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            {t('brandSubtitle')}
          </span>
        </div>
      </Link>

      <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-normal">
        {t('brandDescription')}
      </p>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
          <span>{t('badgeDrivers')}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          <Banknote className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
          <span>{t('badgeZeroCod')}</span>
        </span>
      </div>

      {/* Accepted Payment Methods */}
      <LandingFooterPaymentMethods />
    </div>
  );
}
