'use client';

import React, { useState } from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { MapPin, User, Phone, Map, LocateFixed, Loader2 } from 'lucide-react';

interface PickupSectionProps {
  pickup: PickupLocation;
  onChangePickup: (loc: PickupLocation) => void;
  onOpenMap: () => void;
  error?: string;
}

export function PickupSection({
  pickup,
  onChangePickup,
  onOpenMap,
  error,
}: PickupSectionProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      onChangePickup({
        ...pickup,
        name: 'Current Location',
        address: 'Current Location, Khan Daun Penh, Phnom Penh',
        coordinates: { lat: 11.5564, lng: 104.9282 },
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        onChangePickup({
          ...pickup,
          name: 'Current Location',
          address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Phnom Penh`,
          coordinates: { lat: latitude, lng: longitude },
        });
      },
      () => {
        setIsLocating(false);
        // Fallback for denied permission or unsupported environment
        onChangePickup({
          ...pickup,
          name: 'Current Location',
          address: 'Current Location (Central Phnom Penh)',
          coordinates: { lat: 11.5564, lng: 104.9282 },
        });
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  return (
    <FormSection
      number="A"
      title="Pickup Location"
      subtitle="Where courier should collect the parcel"
      action={
        <button
          type="button"
          onClick={onOpenMap}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 transition cursor-pointer"
        >
          <Map className="h-3.5 w-3.5" />
          <span>Select on Map / Hub</span>
        </button>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pickup-address">Pickup Address / Warehouse</Label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer transition select-none disabled:opacity-60"
            >
              {isLocating ? (
                <Loader2 className="h-3 w-3 animate-spin text-brand-600" />
              ) : (
                <LocateFixed className="h-3 w-3 text-brand-600" />
              )}
              <span>{isLocating ? 'Locating…' : 'Use current location'}</span>
            </button>
          </div>

          <Input
            id="pickup-address"
            placeholder="e.g. St 271, Mean Chey, Phnom Penh"
            value={pickup.address}
            onChange={(e) =>
              onChangePickup({
                ...pickup,
                address: e.target.value,
                name: e.target.value.split(',')[0] || 'My Location',
              })
            }
            leftIcon={<MapPin className="h-4 w-4 text-brand-600" />}
            error={Boolean(error)}
          />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="sender-name">Contact Name (Optional)</Label>
            <Input
              id="sender-name"
              placeholder="e.g. Warehouse Dispatcher"
              value={pickup.senderName || ''}
              onChange={(e) => onChangePickup({ ...pickup, senderName: e.target.value })}
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sender-phone">Contact Phone (Optional)</Label>
            <Input
              id="sender-phone"
              type="tel"
              placeholder="012 888 999"
              value={pickup.senderPhone || ''}
              onChange={(e) => onChangePickup({ ...pickup, senderPhone: e.target.value })}
              leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
