'use client';

import React from 'react';
import { DropoffLocation, GeoCoordinates, PickupLocation } from '@/features/booking/types/booking-types';
import { LocationSearch } from '../molecules/location-search';
import { FormField } from '../molecules/form-field';
import { Input } from '../atoms/input';
import { MapPin, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(
  () => import('./delivery-map').then((mod) => mod.DeliveryMap),
  { ssr: false }
);

interface DropoffPickerProps {
  pickupLocation: PickupLocation;
  dropoffLocation: DropoffLocation;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
}

export function DropoffPicker({
  pickupLocation,
  dropoffLocation,
  onChangeDropoff,
}: DropoffPickerProps) {
  const handleCoordsChange = (coords: GeoCoordinates) => {
    onChangeDropoff({
      ...dropoffLocation,
      coordinates: coords,
      // If address is generic or empty, provide coordinates label
      address:
        dropoffLocation.address ||
        `Pinned Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
    });
  };

  const handleSelectSearch = (address: string, coords: GeoCoordinates) => {
    onChangeDropoff({
      ...dropoffLocation,
      address,
      coordinates: coords,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Drop-off Destination</h3>
        <p className="text-xs text-slate-500">
          Search the address or drag the red marker to pinpoint the exact drop-off spot
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <FormField label="Search Drop-off Address" required>
          <LocationSearch
            placeholder="Search village, sangkat, khan, building name..."
            onSelectLocation={handleSelectSearch}
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-rose-500" />
              <span>Google Maps Destination &amp; Route</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Lat: {dropoffLocation.coordinates.lat.toFixed(4)} | Lng:{' '}
              {dropoffLocation.coordinates.lng.toFixed(4)}
            </span>
          </div>

          <DeliveryMap
            pickupCoords={pickupLocation.coordinates}
            dropoffCoords={dropoffLocation.coordinates}
            isDraggableDropoff={true}
            onDropoffChange={handleCoordsChange}
            className="h-72 w-full"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Confirmed Drop-off Address" required>
            <Input
              value={dropoffLocation.address}
              onChange={(e) =>
                onChangeDropoff({ ...dropoffLocation, address: e.target.value })
              }
              placeholder="e.g. House #14, Street 2004, Phnom Penh"
              leftIcon={<MapPin className="h-4 w-4 text-rose-500" />}
              required
            />
          </FormField>

          <FormField label="Nearby Landmark (Optional)">
            <Input
              value={dropoffLocation.landmark || ''}
              onChange={(e) =>
                onChangeDropoff({ ...dropoffLocation, landmark: e.target.value })
              }
              placeholder="e.g., Behind Total Gas Station, opposite Blue House"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

