'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Navigation,
  Phone,
  User,
  FileText,
  Map as MapIcon,
  EyeOff,
} from 'lucide-react';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { formatPhoneNumber } from '@/lib/phone-number';
import { useTranslations } from 'next-intl';
import { StopTrackCopyActions } from '@/components/molecules/stop-track-copy-actions';

const DeliveryMap = dynamic(
  () => import('@/components/organisms/delivery-map').then((m) => m.DeliveryMap),
  { ssr: false }
);

interface BookingDetailRouteProps {
  order: BookingOrder;
  destinationStops: DropoffStop[];
  showMap: boolean;
  onToggleMap: () => void;
}

export function BookingDetailRoute({
  order,
  destinationStops,
  showMap,
  onToggleMap,
}: BookingDetailRouteProps) {
  const tDetails = useTranslations('BookingDetails');
  const tPayment = useTranslations('Payment');
  const hasCoordinates =
    Boolean(order.pickup?.coordinates?.lat) &&
    Boolean(order.dropoff?.coordinates?.lat);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-secondary-600" />
          <span>{tDetails('routeAndStopsTitle')}</span>
        </h3>

        {hasCoordinates && (
          <button
            type="button"
            onClick={onToggleMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {showMap ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>{tDetails('hideMap')}</span>
              </>
            ) : (
              <>
                <MapIcon className="h-3.5 w-3.5 text-secondary-600" />
                <span>{tDetails('showMap')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Pickup to Drop-off Stops First (Immediate Scannability) */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {/* Pickup Origin */}
        <div className="relative space-y-1">
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-4 ring-white">
            A
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {tDetails('pickupBadge')}
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {order.pickup.name}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {order.pickup.address}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
            {order.pickup.senderName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                <span>{order.pickup.senderName}</span>
              </span>
            )}
            {order.pickup.senderPhone && (
              <a
                href={`tel:${order.pickup.senderPhone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 font-mono hover:text-secondary-700"
              >
                <Phone className="h-3 w-3 text-slate-400" />
                <span>{formatPhoneNumber(order.pickup.senderPhone)}</span>
              </a>
            )}
            {order.pickup.riderNote && (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <FileText className="h-3 w-3" />
                <span>{order.pickup.riderNote}</span>
              </span>
            )}
          </div>
        </div>

        {/* Drop-off Stops */}
        {destinationStops.map((stop, idx) => {
          const letter = String.fromCharCode(66 + idx);
          return (
            <div key={stop.id || idx} className="relative space-y-1">
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-bold text-white ring-4 ring-white">
                {letter}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary-700">
                    {tDetails('dropoffBadge')} {destinationStops.length > 1 ? `(${letter})` : ''}
                  </span>
                  {stop.recipient?.name && (
                    <span className="text-xs font-semibold text-slate-900">
                      {stop.recipient.name}
                    </span>
                  )}
                  {typeof stop.codAmount === 'number' && stop.codAmount > 0 && (
                    <span className="rounded border border-primary-200 bg-primary-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary-900">
                      COD ${stop.codAmount.toFixed(2)}
                    </span>
                  )}
                </div>
                {destinationStops.length > 1 && order.status !== 'cancelled' && (
                  <StopTrackCopyActions
                    tracking={order.trackingNumber}
                    stop={stop}
                    index={idx}
                    linkLabel={tPayment('copyLiveLink')}
                  />
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {stop.dropoff.address}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                {stop.recipient?.phoneNumber && (
                  <a
                    href={`tel:${stop.recipient.phoneNumber.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1 font-mono text-secondary-700 font-medium hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{formatPhoneNumber(stop.recipient.phoneNumber)}</span>
                  </a>
                )}
                {stop.dropoff?.landmark && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Navigation className="h-3 w-3 text-slate-400" />
                    <span>{stop.dropoff.landmark}</span>
                  </span>
                )}
                {stop.recipient?.notes && (
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <FileText className="h-3 w-3 text-slate-400" />
                    <span>{stop.recipient.notes}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Preview Below Route Stops */}
      {hasCoordinates && showMap && (
        <div className="rounded-xl overflow-hidden border border-slate-100 pt-1">
          <DeliveryMap
            pickupCoords={order.pickup.coordinates}
            dropoffCoords={order.dropoff.coordinates}
            waypoints={destinationStops.map((s) => s.dropoff.coordinates)}
            isDraggableDropoff={false}
            className="h-56 sm:h-64 w-full"
          />
        </div>
      )}
    </div>
  );
}
