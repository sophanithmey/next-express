'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { getCancellationEligibility } from '@/features/booking/services/booking-cancellation-policy';
import { StatusBadge } from './status-badge';
import { APP_CONFIG } from '@/lib/constants';
import { formatPhoneNumber } from '@/lib/phone-number';
import { User, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BookingJiraCourierCard } from './booking-jira-courier-card';
import { BookingJiraModalActions } from './booking-jira-modal-actions';

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

  const cancelEligibility = getCancellationEligibility(order);
  const canCancel = cancelEligibility === 'can_cancel';
  const requiresHotlineCancel = cancelEligibility === 'contact_hotline';

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
      <BookingJiraCourierCard deliverer={order.deliverer} />

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
      <BookingJiraModalActions
        order={order}
        canCancel={canCancel}
        requiresHotlineCancel={requiresHotlineCancel}
        onBookAgain={onBookAgain}
        onRequestCancel={onRequestCancel}
      />
    </div>
  );
}
