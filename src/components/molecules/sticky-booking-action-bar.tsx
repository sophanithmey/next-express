'use client';

import React from 'react';
import { ArrowRight, Banknote, ShieldCheck, Bookmark } from 'lucide-react';
import { Button } from '../atoms/button';
import { APP_CONFIG } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface StickyBookingActionBarProps {
  fee: number;
  stopsCount: number;
  codAmount?: number;
  isCod: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

export function StickyBookingActionBar({
  fee,
  stopsCount,
  codAmount = 0,
  isCod,
  isSubmitting = false,
  onClick,
  onSaveDraft,
  isSavingDraft = false,
}: StickyBookingActionBarProps) {
  const t = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="sticky bottom-4 z-30 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Fee and COD breakdown */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('estimatedFee')}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {stopsCount} {stopsCount > 1 ? tCommon('stops') : tCommon('stop')}
            </span>
            {isCod && codAmount > 0 && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-900 border border-primary-200/90 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Banknote className="h-3 w-3 text-primary-700" />
                <span>{t('codCollection')}: {APP_CONFIG.currencySymbol}{codAmount.toFixed(2)}</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {APP_CONFIG.currencySymbol}
              {fee.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {t('usdPayUponDispatch')}
            </span>
          </div>

          <div className="flex sm:hidden items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3 text-secondary-600" />
            <span>{t('mobileCheckoutHint')}</span>
          </div>
        </div>

        {/* Right: Primary and Secondary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-nowrap">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onSaveDraft}
              isLoading={isSavingDraft}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-bold border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition whitespace-nowrap shrink-0"
              leftIcon={<Bookmark className="h-4 w-4 shrink-0" />}
            >
              <span>{t('saveDraft')}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onClick}
            isLoading={isSubmitting}
            className="flex-1 sm:flex-initial px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] whitespace-nowrap shrink-0"
            rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
          >
            <span>{t('continueToPayment')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
