'use client';

import React from 'react';
import { Truck, X, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthModalHeaderProps {
  onClose: () => void;
}

export function AuthModalHeader({ onClose }: AuthModalHeaderProps) {
  const t = useTranslations('Authentication');

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-4 bg-white">
      <div className="flex items-center gap-3.5">
        {/* Brand Icon Box */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-600 text-white shadow-xs ring-4 ring-secondary-50">
          <Truck className="h-5.5 w-5.5 text-primary-400" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500" />
          </span>
        </div>

        {/* Brand Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 tracking-tight">WingExpress</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-200/90 px-2.5 py-0.5 text-[9px] font-bold text-primary-900 uppercase tracking-wider">
              <ShieldCheck className="h-2.5 w-2.5 text-primary-700" />
              <span>{t('secureCheckout')}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">{t('network')}</p>
        </div>
      </div>

      {/* Close Modal Button */}
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        aria-label="Close modal"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
