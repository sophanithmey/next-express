'use client';

import React from 'react';
import { ExternalLink, Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { useLocationMap } from '@/features/booking/hooks/use-location-map';
import { DeliveryMap } from '@/components/organisms/delivery-map';

interface LocationMapProps {
  coordinates: GeoCoordinates;
  addressLabel?: string;
  onSelectCoordinates: (coords: GeoCoordinates) => void;
  onOutOfBounds?: (coords: GeoCoordinates) => void;
  className?: string;
}

/**
 * Interactive Google Map canvas with draggable pin & tap-to-pin,
 * colored Phnom Penh delivery zone polygon overlay, and fallback to DeliveryMap.
 */
export function LocationMap({
  coordinates,
  addressLabel,
  onSelectCoordinates,
  onOutOfBounds,
  className = 'h-56 sm:h-64 w-full',
}: LocationMapProps) {
  const tPicker = useTranslations('LocationPicker');
  const { containerRef, status } = useLocationMap({
    coordinates,
    markerTitle: addressLabel || tPicker('selectedAddress'),
    onSelectCoordinates,
    onOutOfBounds,
  });

  if (status === 'fallback') {
    return (
      <DeliveryMap
        dropoffCoords={coordinates}
        isDraggableDropoff={false}
        className={className}
      />
    );
  }

  const externalMapUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs ${className}`}
    >
      <div ref={containerRef} className="h-full w-full" data-testid="google-map-canvas" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-100/90 text-xs font-semibold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          <span>{tPicker('loadingMap')}</span>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm border border-primary-300 backdrop-blur-xs select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            <span className="text-slate-950 font-bold">{tPicker('phnomPenhZoneBadge')}</span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200/80 hover:text-slate-950 hover:bg-white transition backdrop-blur-xs"
            >
              <MapPin className="h-3 w-3 text-red-500 shrink-0" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
