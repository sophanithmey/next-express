'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MapPin, Radio, RefreshCw, XCircle } from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { StatusBadge } from '@/components/molecules/status-badge';
import { cn } from '@/lib/cn';

const DeliveryMap = dynamic(
  () => import('@/components/organisms/delivery-map').then((m) => m.DeliveryMap),
  { ssr: false }
);

interface LiveTrackingMapHeroProps {
  order: BookingOrder;
  isCancelled: boolean;
  isRefreshing: boolean;
  formattedUpdatedAt: string;
  onRefresh: () => void;
}

/**
 * Slim top status header with Refresh control paired directly with a large hero Google Map
 * so receivers immediately see live delivery routing upon opening the link.
 */
export function LiveTrackingMapHero({
  order,
  isCancelled,
  isRefreshing,
  formattedUpdatedAt,
  onRefresh,
}: LiveTrackingMapHeroProps) {
  const tLive = useTranslations('LiveTracking');
  const tDelivery = useTranslations('Delivery');

  const speedLabel =
    order.deliveryOption === 'scheduled'
      ? tDelivery('scheduled')
      : order.deliveryOption === 'same_day'
      ? tDelivery('sameDay')
      : tDelivery('instant');

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
      {/* Slim Receiver Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-2.5 py-0.5 text-[11px] font-bold text-danger-700">
              <XCircle className="h-3.5 w-3.5" />
              <span>{tLive('cancelledBadge')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-2.5 py-0.5 text-[11px] font-bold text-success-800">
              <Radio className="h-3.5 w-3.5 text-success-600 animate-pulse" />
              <span>{tLive('liveBadge')}</span>
            </span>
          )}

          <StatusBadge status={order.status} />

          <span className="font-mono text-xs sm:text-sm font-black text-slate-900 tracking-tight">
            #{order.trackingNumber}
          </span>

          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <MapPin className="h-3 w-3 text-secondary-600" />
            <span>{speedLabel}</span>
          </span>

          {formattedUpdatedAt && (
            <span className="hidden sm:inline text-[11px] font-medium text-slate-400">
              · {tLive('updatedAt', { time: formattedUpdatedAt })}
            </span>
          )}
        </div>

        {/* Single Primary Action: Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label={tLive('refreshStatus')}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-secondary-200 bg-secondary-50/80 px-3.5 py-2 text-xs font-bold text-secondary-700 hover:bg-secondary-100/80 disabled:opacity-60 active:scale-95 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          <span>{tLive('refreshStatus')}</span>
        </button>
      </div>

      {/* Hero Map Canvas */}
      {order.pickup?.coordinates && order.dropoff?.coordinates && (
        <div className="bg-slate-50/70 p-2.5 sm:p-3">
          <DeliveryMap
            pickupCoords={order.pickup.coordinates}
            dropoffCoords={order.dropoff.coordinates}
            waypoints={order.dropoffs?.map((s) => s.dropoff.coordinates)}
            className="h-72 sm:h-96 lg:h-104 w-full"
          />
        </div>
      )}
    </div>
  );
}

