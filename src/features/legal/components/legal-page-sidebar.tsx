'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { BookOpen, FileText, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface LegalPageSidebarProps {
  currentSlug: 'about-us' | 'terms-of-use' | 'privacy-policy';
}

export function LegalPageSidebar({ currentSlug }: LegalPageSidebarProps) {
  const t = useTranslations('Footer');

  const navItems = [
    {
      slug: 'about-us',
      label: t('aboutUs'),
      href: '/about-us',
      icon: BookOpen,
    },
    {
      slug: 'terms-of-use',
      label: t('termsOfUse'),
      href: '/terms-of-use',
      icon: FileText,
    },
    {
      slug: 'privacy-policy',
      label: t('privacyPolicy'),
      href: '/privacy-policy',
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className='space-y-5 lg:sticky lg:top-24'>
      {/* Navigation Card */}
      <div className='rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1.5'>
        <span className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1'>
          {t('aboutColTitle')}
        </span>

        <nav aria-label='Legal Navigation' className='space-y-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSlug === item.slug;

            return (
              <Link
                key={item.slug}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-secondary-50 text-secondary-700 border border-secondary-200/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-secondary-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Support Quick Contact Box */}
      <div className='rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3'>
        <span className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1'>
          {t('contactColTitle')}
        </span>

        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className='group flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5 hover:bg-white hover:border-secondary-300 transition-all cursor-pointer'
        >
          <div className='flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-secondary-600 text-white shadow-2xs'>
            <PhoneCall className='h-3.5 w-3.5 text-primary-400' />
          </div>
          <div>
            <span className='block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-tight'>
              {t('hotline')}
            </span>
            <span className='block text-xs font-bold text-slate-900 group-hover:text-secondary-600 transition tracking-tight'>
              {APP_CONFIG.supportPhone}
            </span>
          </div>
        </a>

        <a
          href='https://maps.app.goo.gl/nwLSJfAwY1uHydXp8'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-start gap-2 rounded-xl p-2 text-[11px] text-slate-500 hover:text-slate-800 transition leading-relaxed'
        >
          <MapPin className='h-3.5 w-3.5 text-primary-500 shrink-0 mt-0.5' />
          <span className='line-clamp-2'>{t('headquartersAddress')}</span>
        </a>
      </div>
    </aside>
  );
}

