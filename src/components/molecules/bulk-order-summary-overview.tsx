'use client';

import React from 'react';
import { Calendar, MapPinHouse, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { MAX_BULK_ORDERS } from '@/lib/constants';

interface BulkOrderSummaryOverviewProps {
  pickup: PickupLocation;
  deliveryOption: DeliverySpeedOption;
  ordersCount: number;
  totalStops: number;
}

export function BulkOrderSummaryOverview({
  pickup,
  deliveryOption,
  ordersCount,
  totalStops,
}: BulkOrderSummaryOverviewProps) {
  const tBooking = useTranslations('Booking');
  const tPickup = useTranslations('Pickup');
  const tDelivery = useTranslations('Delivery');

  const isScheduled =
    deliveryOption === 'scheduled' || deliveryOption === 'same_day';
  const speedLabel =
    deliveryOption === 'scheduled'
      ? tDelivery('scheduled')
      : deliveryOption === 'same_day'
        ? tDelivery('sameDay')
        : tDelivery('instant');

  return (
    <div className="space-y-4">
      {/* Pickup & Speed overview */}
      <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <MapPinHouse className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-700 block">
              {pickup.name || tPickup('origin')}
            </span>
            <p className="text-[11px] text-slate-500 truncate">
              {pickup.address || tBooking('addressPending')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70">
          <span className="text-slate-500 flex items-center gap-1.5">
            {isScheduled ? (
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span>{tDelivery('speed')}</span>
          </span>
          <span className="font-bold text-slate-800">{speedLabel}</span>
        </div>
      </div>

      {/* Batch Counters */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
          <span className="text-[11px] text-slate-500 block">
            {tBooking('bulkSummaryOrders')}
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {ordersCount}
            <span className="text-xs font-semibold text-slate-400">
              /{MAX_BULK_ORDERS}
            </span>
          </span>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
          <span className="text-[11px] text-slate-500 block">
            {tBooking('bulkSummaryStops')}
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {totalStops}
          </span>
        </div>
      </div>
    </div>
  );
}
