import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { LandingHeroIllustration } from './landing-hero-illustration';
import { LandingHeroHistoryButton } from './landing-hero-history-button';

export function LandingHero() {
  const t = useTranslations('Home');

  return (
    <section className='relative overflow-hidden py-10 sm:py-16 lg:py-20'>
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center'>
        {/* Left Column: Headline, Copy, Action Buttons */}
        <div className='lg:col-span-6 space-y-6 text-center lg:text-left'>
          <div className='inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-800'>
            <span className='flex h-2 w-2 rounded-full bg-secondary-600 animate-pulse' />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-snug lg:leading-tight'>
            {t('heroTitle')}
          </h1>

          <p className='mx-auto lg:mx-0 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed'>
            {t('heroSubtitle')}
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2'>
            <Link
              href='/booking'
              prefetch={true}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md hover:shadow-lg transition active:scale-[0.99]'
            >
              <span>{t('ctaBook')}</span>
              <ArrowRight className='h-4 w-4' />
            </Link>

            <LandingHeroHistoryButton />
          </div>

          <div className='flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-500'>
            <span className='flex items-center gap-1.5'>
              <CheckCircle2 className='h-4 w-4 text-brand-600' />{' '}
              {t('trustNoRegister')}
            </span>
            <span className='flex items-center gap-1.5'>
              <CheckCircle2 className='h-4 w-4 text-brand-600' />{' '}
              {t('trustPayment')}
            </span>
          </div>
        </div>

        {/* Right Column: Animated Delivery Driver Handover SVG */}
        <div className='lg:col-span-6'>
          <LandingHeroIllustration ariaLabel={t('heroTitle')} />
        </div>
      </div>
    </section>
  );
}
