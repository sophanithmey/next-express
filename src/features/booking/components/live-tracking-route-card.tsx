'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPinHouse, Navigation, User } from 'lucide-react';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { BookingSuccessStepper } from '@/components/molecules/booking-success-stepper';

interface LiveTrackingRouteCardProps {
  order: BookingOrder;
  activeStep: number;
  etaLabel: string;
  isCancelled: boolean;
  destinationStops: DropoffStop[];
}

/**
 * Displays parcel milestone progress and the connected pickup-to-destination timeline
 * below the hero map.
 */
export function LiveTrackingRouteCard({
  order,
  activeStep,
  etaLabel,
  isCancelled,
  destinationStops,
}: LiveTrackingRouteCardProps) {
  const tLive = useTranslations('LiveTracking');
  const tPayment = useTranslations('Payment');
  const tPickup = useTranslations('Pickup');
  const tCommon = useTranslations('Common');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
        <BookingSuccessStepper
          activeStep={activeStep}
          etaLabel={etaLabel}
          isCancelled={isCancelled}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            {tLive('routeStopsTitle')}
          </h2>
          {destinationStops.length > 1 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
              {destinationStops.length} {tCommon('stops')}
            </span>
          )}
        </div>

        <div className="relative space-y-5 pl-7 before:absolute before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {/* Pickup Origin */}
          <div className="relative">
            <span className="absolute -left-7 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 ring-4 ring-white border border-secondary-200">
              <MapPinHouse className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {tPayment('pickupPointLabel')}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {order.pickup.name || tPickup('warehouse')}
            </p>
            {order.pickup.address && (
              <p className="text-xs text-slate-500 mt-0.5">{order.pickup.address}</p>
            )}
          </div>

          {/* Destination Stops */}
          {destinationStops.map((stop, idx) => (
            <div key={stop.id || idx} className="relative">
              <span className="absolute -left-7 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 text-success-700 ring-4 ring-white border border-success-200">
                {destinationStops.length > 1 ? (
                  <span className="font-mono text-[10px] font-black">{idx + 1}</span>
                ) : (
                  <Navigation className="h-3 w-3" />
                )}
              </span>

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {destinationStops.length > 1
                  ? tPayment('stopOfTotal', { index: idx + 1, total: destinationStops.length })
                  : tPayment('dropoffLabel')}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {stop.dropoff?.address}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <User className="h-3 w-3 text-slate-500" />
                  <span>{stop.recipient?.name || tLive('defaultRecipient')}</span>
                </div>
                {typeof stop.codAmount === 'number' && stop.codAmount > 0 && (
                  <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-900">
                    COD ${stop.codAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
