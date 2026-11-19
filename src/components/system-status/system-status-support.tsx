'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Headphones, PhoneCall, Send } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface SystemStatusSupportProps {
  className?: string;
}

export function SystemStatusSupport({ className }: SystemStatusSupportProps) {
  const t = useTranslations('SystemStatus');

  return (
    <div className={`border-t border-slate-100 pt-5 text-center ${className || ''}`}>
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
        <Headphones className="h-3.5 w-3.5 text-secondary-600" />
        <span>{t('common.liveSupportTitle')}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-medium text-slate-700 hover:bg-white hover:text-secondary-600 hover:border-slate-300 active:scale-[0.98] transition shadow-2xs"
        >
          <PhoneCall className="h-3.5 w-3.5 text-secondary-600" />
          <span>{t('common.callSupport', { phone: APP_CONFIG.supportPhone })}</span>
        </a>

        <a
          href={APP_CONFIG.supportTelegram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-medium text-slate-700 hover:bg-white hover:text-sky-600 hover:border-slate-300 active:scale-[0.98] transition shadow-2xs"
        >
          <Send className="h-3.5 w-3.5 text-sky-500" />
          <span>{t('common.telegramSupport')}</span>
        </a>
      </div>
    </div>
  );
}
