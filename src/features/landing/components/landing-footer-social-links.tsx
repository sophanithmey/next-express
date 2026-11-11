'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';

interface SocialItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function LandingFooterSocialLinks() {
  const t = useTranslations('Footer');
  const socials: SocialItem[] = [
    {
      name: 'Facebook',
      href: APP_CONFIG.socialLinks.facebook,
      icon: (
        <svg
          className='h-4 w-4 fill-white'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: APP_CONFIG.socialLinks.telegram,
      icon: (
        <svg
          className='h-4 w-4 fill-white'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.38-.49 1.03-.75 4.04-1.76 6.74-2.92 8.09-3.5 3.85-1.65 4.65-1.93 5.17-1.94.11 0 .37.03.54.17.14.12.18.28.2.45-.01.07-.01.16-.02.25z' />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: APP_CONFIG.socialLinks.instagram,
      icon: (
        <svg
          className='h-4 w-4 fill-white'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: APP_CONFIG.socialLinks.tiktok,
      icon: (
        <svg
          className='h-4 w-4 fill-white'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.42a6.34 6.34 0 0 0-.85-.06 6.34 6.34 0 1 0 6.34 6.34V8.58a8.28 8.28 0 0 0 3.77.91V6.69z' />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: APP_CONFIG.socialLinks.youtube,
      icon: (
        <svg
          className='h-4 w-4 fill-white'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
        </svg>
      ),
    },
  ];

  return (
    <div className='space-y-2 pt-2'>
      <span className='text-[11px] font-bold text-slate-800 tracking-tight block'>
        {t('followUs')}
      </span>
      <div className='flex items-center gap-1.5'>
        {socials.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t('followAria', { name: item.name })}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#271E69] text-white shadow-2xs hover:bg-[#382E8A] hover:scale-105 active:scale-95 transition-all cursor-pointer'
          >
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
