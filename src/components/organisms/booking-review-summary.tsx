'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { BookingFormData, DropoffStop } from '@/features/booking/types/booking-types';
import { DELIVERY_SHIFTS } from '@/features/booking/data/delivery-schedule-options';
import { Edit3, Zap, Clock, Calendar, Package, Banknote } from 'lucide-react';
import { BookingRouteTimeline } from '../molecules/booking-route-timeline';
import { APP_CONFIG } from '@/lib/constants';

interface BookingReviewSummaryProps {
  formData: BookingFormData;
}

export function BookingReviewSummary({ formData }: BookingReviewSummaryProps) {
  const tCommon = useTranslations('Common');
  const tPayment = useTranslations('Payment');
  const tDelivery = useTranslations('Delivery');

  const stops: DropoffStop[] =
    formData.dropoffs && formData.dropoffs.length > 0
      ? formData.dropoffs
      : [
          {
            id: 'stop-1',
            recipient: formData.recipient,
            dropoff: formData.dropoff,
            imageUrl: formData.recipient.imageUrl,
          },
        ];

  const isSameDay = formData.deliveryOption === 'same_day';
  const isScheduled = formData.deliveryOption === 'scheduled';
  const scheduleInfo = formData.deliverySchedule;
  const activeShift =
    DELIVERY_SHIFTS.find((s) => s.id === (scheduleInfo?.shift || 'morning')) ||
    DELIVERY_SHIFTS[0];
  const matchedSlot = activeShift.slots.find(
    (slot) => slot.value === scheduleInfo?.timeSlot
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
      {/* Itinerary Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {tPayment('routeAndOrderTitle')}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
            isScheduled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isSameDay
              ? 'bg-secondary-50 border-secondary-200 text-secondary-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isScheduled ? (
              <>
                <Calendar className="h-3 w-3 text-emerald-600" />
                <span>
                  {tDelivery('scheduledLabel')}{' '}
                  {scheduleInfo?.dateLabel?.split('(')[0]?.trim() || tDelivery('tomorrowShort')} •{' '}
                  {tDelivery(activeShift.nameKey)}
                  {matchedSlot
                    ? ` (${tDelivery(matchedSlot.labelKey)})`
                    : scheduleInfo?.timeSlot
                    ? ` (${scheduleInfo.timeSlot})`
                    : ''}
                </span>
              </>
            ) : isSameDay ? (
              <>
                <Clock className="h-3 w-3 text-secondary-600" />
                <span>{tDelivery('sameDay')}</span>
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 text-amber-600" />
                <span>{tPayment('expressDispatchBadge')}</span>
              </>
            )}
          </span>
        </div>

        <Link
          href="/booking"
          className="flex items-center gap-1 text-xs font-semibold text-secondary-600 hover:text-secondary-700 transition"
        >
          <Edit3 className="h-3 w-3" />
          <span>{tCommon('edit')}</span>
        </Link>
      </div>

      {/* Connected Route Stepper */}
      <BookingRouteTimeline pickup={formData.pickup} stops={stops} />

      {/* Parcel & COD Integrated Strip */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block leading-tight">
              {formData.parcel.sellerOrderRef || tPayment('defaultOrderRef')}
            </span>
            <span className="text-[11px] text-slate-500">
              {formData.parcel.description || tPayment('defaultParcelDesc')}
            </span>
          </div>
        </div>

        <div>
          {formData.cod.isCod && formData.cod.amount > 0 ? (
            <div className="flex items-center gap-1.5 bg-primary-100/70 border border-primary-200 px-2.5 py-1 rounded-lg text-primary-950 font-bold text-xs">
              <Banknote className="h-3.5 w-3.5 text-primary-700" />
              <span>
                {tPayment('codBadge', {
                  amount: `${APP_CONFIG.currencySymbol}${formData.cod.amount.toFixed(2)}`,
                })}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              {tPayment('noCodCollection')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
