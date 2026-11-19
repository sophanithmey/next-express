'use client';

import React, { useState } from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { Check, Copy, Repeat, ShieldCheck, XCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CancelHotlineCallout } from './cancel-hotline-callout';

interface BookingJiraModalActionsProps {
  order: BookingOrder;
  canCancel: boolean;
  requiresHotlineCancel: boolean;
  onBookAgain?: (order: BookingOrder) => void;
  onRequestCancel?: (order: BookingOrder) => void;
}

export function BookingJiraModalActions({
  order,
  canCancel,
  requiresHotlineCancel,
  onBookAgain,
  onRequestCancel,
}: BookingJiraModalActionsProps) {
  const tHistory = useTranslations('BookingHistory');
  const tPayment = useTranslations('Payment');
  const [isCopied, setIsCopied] = useState(false);

  const isCancelled = order.status === 'cancelled';

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/track/${order.trackingNumber}`;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Live tracking link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-2 pt-1">
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
      >
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span>{isCopied ? 'Link Copied!' : 'Copy Live Tracking Link'}</span>
      </button>

      {!isCancelled && (
        <Link
          href={`/track/${order.trackingNumber}`}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-slate-950 font-bold py-2 text-xs shadow-xs transition"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Open Real-Time GPS Tracking</span>
        </Link>
      )}

      {onBookAgain && (
        <button
          type="button"
          onClick={() => onBookAgain(order)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 text-xs font-semibold transition cursor-pointer"
        >
          <Repeat className="h-3.5 w-3.5" />
          <span>{tHistory('bookAgain')}</span>
        </button>
      )}

      {!isCancelled && canCancel && onRequestCancel && (
        <button
          type="button"
          onClick={() => onRequestCancel(order)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-danger-200 bg-danger-50/70 hover:bg-danger-100/70 text-danger-700 py-2 text-xs font-bold transition cursor-pointer"
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>{tPayment('cancelOrder')}</span>
        </button>
      )}

      {!isCancelled && requiresHotlineCancel && (
        <CancelHotlineCallout
          trackingNumber={order.trackingNumber || order.id}
        />
      )}
    </div>
  );
}
