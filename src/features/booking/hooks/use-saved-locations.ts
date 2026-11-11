'use client';

import { useState, useEffect, useCallback } from 'react';
import { PickupLocation } from '../types/booking-types';
import { CreateSavedLocationInput } from '../schemas/location-schema';

export type SavedLocationItem = PickupLocation & { tag?: string };

/**
 * Loads distance-sorted consumer saved addresses from `/api/locations` when authenticated,
 * falling back to `initialLocations` for guest browsing or offline fallback,
 * and exposes `createLocation` to persist new addresses via `POST /api/locations`.
 */
export function useSavedLocations(
  initialLocations: SavedLocationItem[],
  isAuthenticated: boolean,
  locale: string,
) {
  const [locations, setLocations] = useState<SavedLocationItem[]>(initialLocations);

  const refreshLocations = useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams({ lang: locale.toUpperCase() });
      const res = await fetch(`/api/locations?${params.toString()}`, {
        cache: 'no-store',
        signal,
      });
      if (!res.ok) return;

      const data: unknown = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocations(data as SavedLocationItem[]);
      }
    },
    [locale],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setLocations(initialLocations);
      return;
    }

    const controller = new AbortController();
    refreshLocations(controller.signal).catch(() => {
      // Keep current fallback locations on abort or network failure
    });

    return () => controller.abort();
  }, [isAuthenticated, initialLocations, refreshLocations]);

  const createLocation = useCallback(
    async (input: CreateSavedLocationInput): Promise<SavedLocationItem> => {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale.toUpperCase(),
        },
        body: JSON.stringify(input),
      });

      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (data as { message?: string })?.message || 'Failed to save location';
        throw new Error(message);
      }

      const created = data as SavedLocationItem;
      setLocations((prev) => [
        created,
        ...prev.filter((item) => item.id !== created.id),
      ]);
      refreshLocations().catch(() => {
        // Non-blocking background sync after optimistic prepend
      });

      return created;
    },
    [locale, refreshLocations],
  );

  return {
    savedLocations: locations,
    refreshLocations,
    createLocation,
  };
}
