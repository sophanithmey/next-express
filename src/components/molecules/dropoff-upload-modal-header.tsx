'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Navigation, X } from 'lucide-react';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';

interface DropoffUploadModalHeaderProps {
  onClose: () => void;
}

export function DropoffUploadModalHeader({ onClose }: DropoffUploadModalHeaderProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/80">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs">
          <Navigation className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              {tBooking('dropoffUploadModalTitle')}
            </h3>
            <span className="rounded-full bg-primary-50 border border-primary-300 px-2 py-0.5 text-[10px] font-bold text-primary-950">
              {tCommon('stops')} (1–{MAX_DROPOFF_STOPS})
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {tBooking('dropoffUploadModalSubtitle')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
        aria-label={tCommon('close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
