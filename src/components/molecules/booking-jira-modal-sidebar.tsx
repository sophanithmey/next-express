'use client';

import React, { useState } from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { getCancellationEligibility } from '@/features/booking/services/booking-cancellation-policy';
import { StatusBadge } from './status-badge';
import { CancelHotlineCallout } from './cancel-hotline-callout';
import { APP_CONFIG } from '@/lib/constants';
import { formatPhoneNumber } from '@/lib/phone-number';
import {
  Bike,
  Check,
  Copy,
  Phone,
  Repeat,
  ShieldCheck,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';

interface BookingJiraModalSidebarProps {
  order: BookingOrder;
  onBookAgain?: (order: BookingOrder) => void;
  onRequestCancel?: (order: BookingOrder) => void;
}

export function BookingJiraModalSidebar({
  order,
  onBookAgain,
  onRequestCancel,
}: BookingJiraModalSidebarProps) {
  const tDetails = useTranslations('BookingDetails');
  const tHistory = useTranslations('BookingHistory');
  const tPayment = useTranslations('Payment');
  const [isCopied, setIsCopied] = useState(false);

  const cancelEligibility = getCancellationEligibility(order);
  const canCancel = cancelEligibility === 'can_cancel';
  const requiresHotlineCancel = cancelEligibility === 'contact_hotline';
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
    <div className="space-y-4 text-xs">
      {/* Status & Dispatch Speed */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
            {tHistory('colStatus')}
          </span>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-600">
          <span className="flex items-center gap-1 font-medium">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Dispatch Speed:
          </span>
          <span className="font-semibold text-slate-900 capitalize">
            {order.deliveryOption || 'Instant'}
          </span>
        </div>
      </div>

      {/* Assigned Courier */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2 shadow-2xs">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
          {tDetails('courierCardLabel')}
        </span>

        {order.deliverer ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-950 border border-primary-300 font-bold">
                <Bike className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">
                  {order.deliverer.name}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {order.deliverer.phone}
                </p>
              </div>
            </div>

            <a
              href={`tel:${order.deliverer.phone.replace(/\s+/g, '')}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              title="Call driver"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-xs font-medium">
              {tDetails('matchingRider')}
            </span>
          </div>
        )}
      </div>

      {/* Recipient Details */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2 shadow-2xs">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
          {tDetails('recipientCardLabel')}
        </span>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">
              {order.recipient.name || tHistory('defaultCustomer')}
            </p>
            <p className="font-mono text-[11px] text-slate-500">
              {formatPhoneNumber(order.recipient.phoneNumber)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment & COD Summary */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between font-semibold text-slate-600">
          <span>{tHistory('colFee')}:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {APP_CONFIG.currencySymbol}{order.deliveryFee.toFixed(2)}
          </span>
        </div>

        {order.cod?.isCod && order.cod.amount > 0 && (
          <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-200/80 space-y-0.5">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span>{tDetails('codToCollect')}:</span>
              <span className="font-mono text-sm">${order.cod.amount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-amber-800">
              Remitted directly to your Wing Bank account upon delivery.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Payment:</span>
          <span className="font-medium text-slate-800">
            {order.paymentMethod || 'Paid'}
          </span>
        </div>
      </div>

      {/* Modal Actions */}
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
    </div>
  );
}
