import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Banknote } from 'lucide-react';
import { LandingFooterPaymentMethods } from './landing-footer-payment-methods';

export function LandingFooterBrand() {
  const t = useTranslations('Footer');

  return (
    <div className="md:col-span-1 lg:col-span-4 space-y-4">
      {/* Brand Identity */}
      <Link href="/" prefetch={true} className="inline-flex items-center gap-2.5 group">
        <Image
          src="/apple-touch-icon.png"
          alt="Wingmall"
          width={36}
          height={36}
          className="h-9 w-9 rounded-xl object-contain shadow-2xs group-hover:scale-105 transition-transform shrink-0"
        />
        <div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
            Wing<span className="text-primary-500">express</span>
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
