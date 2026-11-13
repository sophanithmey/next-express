'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function LandingFooterAbout() {
  const t = useTranslations('Footer');

  const links = [
    { label: t('aboutUs'), href: '/about-us' },
    { label: t('termsOfUse'), href: '/terms-of-use' },
    { label: t('privacyPolicy'), href: '/privacy-policy' },
  ];

  return (
    <div className='lg:col-span-2'>
      <div className='w-fit max-w-full space-y-3.5 lg:mx-auto'>
        {/* Header */}
        <div>
          <span className='block text-xs font-bold uppercase tracking-wider text-slate-900'>
            {t('aboutColTitle')}
          </span>
          <span className='block text-[11px] text-slate-400 font-medium'>
            {t('aboutSubtitle')}
          </span>
        </div>

        {/* Links list */}
        <ul className='space-y-2.5 text-xs'>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className='font-medium text-slate-500 hover:text-secondary-600 hover:underline underline-offset-2 transition-colors block'
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
