'use client';

import React from 'react';
import {
  ArrowRight,
  Lock,
  PhoneCall,
  Repeat,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/button';
import { APP_CONFIG } from '@/lib/constants';

interface BookingDetailActionsCardProps {
  isPendingPayment: boolean;
  canCancel: boolean;
  isCancelled: boolean;
  isCancelling: boolean;
  onBookAgain: () => void;
  onContinuePayment?: () => void;
  onRequestCancel?: () => void;
}

export function BookingDetailActionsCard({
  isPendingPayment,
  canCancel,
  isCancelled,
  isCancelling,
  onBookAgain,
  onContinuePayment,
  onRequestCancel,
}: BookingDetailActionsCardProps) {
  const tDetails = useTranslations('BookingDetails');
  const tHistory = useTranslations('BookingHistory');
  const tPayment = useTranslations('Payment');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2.5">
      {isPendingPayment && onContinuePayment && (
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onContinuePayment}
          className="w-full min-h-11 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl shadow-sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {tDetails('continuePayment')}
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onBookAgain}
        className="w-full min-h-11 justify-center font-semibold rounded-xl"
        leftIcon={<Repeat className="h-4 w-4 text-brand-600" />}
      >
        {tHistory('bookAgain')}
      </Button>

      {!isCancelled && (
        <div className="border-t border-slate-100 pt-2.5">
          {canCancel && onRequestCancel ? (
            <button
              type="button"
              onClick={onRequestCancel}
              disabled={isCancelling}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50/60 px-4 py-2 text-xs font-bold text-danger-600 hover:bg-danger-100/70 transition"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{tPayment('cancelOrder')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{tPayment('cancelDisabledNote')}</span>
            </div>
          )}
        </div>
      )}

      <a
        href={`tel:${APP_CONFIG.supportPhoneRaw}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 text-slate-600 hover:text-slate-900 text-xs font-semibold transition"
      >
        <PhoneCall className="h-3.5 w-3.5 text-secondary-600" />
        <span>{tDetails('needHelpSupport')} ({APP_CONFIG.supportPhone})</span>
      </a>
    </div>
  );
}

