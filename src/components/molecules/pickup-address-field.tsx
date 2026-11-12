'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { isDetectableLocationInput } from '@/lib/google-maps-link';

interface PickupAddressFieldProps {
  addressId: string;
  pickup: PickupLocation;
  onChange: (pickup: PickupLocation) => void;
  onOpenMap: () => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  addressError?: string;
}

/**
 * Pickup street address input with browser geolocation shortcut and map pin trigger.
 */
export function PickupAddressField({
  addressId,
  pickup,
  onChange,
  onOpenMap,
  onUseCurrentLocation,
  isLocating,
  addressError,
}: PickupAddressFieldProps) {
  const tPickup = useTranslations('Pickup');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={addressId} required>
          {tPickup('addressLabel')}
        </Label>
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer transition select-none disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 className="h-3 w-3 animate-spin text-brand-600" />
          ) : (
            <LocateFixed className="h-3 w-3 text-brand-600" />
          )}
          <span>{isLocating ? tPickup('locating') : tPickup('useCurrentLocation')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Input
            id={addressId}
            placeholder={tPickup('addressPlaceholder')}
            value={pickup.address}
            onChange={(e) =>
              onChange({
                ...pickup,
                address: e.target.value,
                name: e.target.value.split(',')[0] || 'My Location',
              })
            }
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text').trim();
              if (pasted && isDetectableLocationInput(pasted)) {
                e.preventDefault();
                onChange({
                  ...pickup,
                  address: pasted,
                  name: pasted.split(',')[0] || 'My Location',
                });
                onOpenMap();
              }
            }}
            leftIcon={<MapPin className="h-4 w-4 text-brand-600" />}
            error={Boolean(addressError)}
            sizeVariant="md"
          />
        </div>
        <button
          type="button"
          onClick={onOpenMap}
          className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
          title={tPickup('pinOnMap')}
        >
          <MapPin className="h-4 w-4 text-brand-600" />
          <span className="hidden sm:inline">{tPickup('pinOnMap')}</span>
        </button>
      </div>

      {addressError ? (
        <p className="text-xs font-medium text-danger-600">{addressError}</p>
      ) : isDetectableLocationInput(pickup.address) ? (
        <p className="text-xs font-medium text-brand-700">
          Map link or coordinates detected — click Pin on Map to confirm pin location.
        </p>
      ) : null}
    </div>
  );
}

