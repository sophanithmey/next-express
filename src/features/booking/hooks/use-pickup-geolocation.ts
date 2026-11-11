'use client';

import { useState, useCallback, useRef } from 'react';
import { GeoCoordinates } from '../types/booking-types';

export interface ResolvedLocationPatch {
  name: string;
  address: string;
  coordinates: GeoCoordinates;
}

/**
 * Resolves the browser's current GPS coordinates into a formatted Phnom Penh pickup patch,
 * using a callback ref so async responses never apply stale closures.
 */
export function usePickupGeolocation(
  onResolved: (patch: ResolvedLocationPatch) => void
) {
  const [isLocating, setIsLocating] = useState(false);
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  const handleGetCurrentLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      onResolvedRef.current({
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
        onResolvedRef.current({
          name: 'Current Location',
          address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Phnom Penh`,
          coordinates: { lat: latitude, lng: longitude },
        });
      },
      () => {
        setIsLocating(false);
        onResolvedRef.current({
          name: 'Current Location',
          address: 'Current Location (Central Phnom Penh)',
          coordinates: { lat: 11.5564, lng: 104.9282 },
        });
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  }, []);

  return { isLocating, handleGetCurrentLocation };
}

