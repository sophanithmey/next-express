'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  GeocodingServiceError,
  PlaceSuggestion,
  ResolvedPlaceResult,
  getPlaceDetailsById,
  reverseGeocodeCoordinates,
  searchPlacesAutocomplete,
} from '@/features/booking/services/geocoding-service';
import { APP_CONFIG } from '@/lib/constants';

export type GeolocationErrorReason = 'permission_denied' | 'unavailable' | 'timeout';
export type ReverseGeocodeErrorReason = 'not_found' | 'failed';

interface UseLocationGeocoderOptions {
  isOpen: boolean;
  onReverseGeocoded: (result: { address: string; placeId?: string }) => void;
}

/**
 * Encapsulates Places Autocomplete, race-safe reverse geocoding,
 * and browser GPS geolocation with explicit error classification.
 */
export function useLocationGeocoder({ isOpen, onReverseGeocoded }: UseLocationGeocoderOptions) {
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placesSearchedOnce, setPlacesSearchedOnce] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<ReverseGeocodeErrorReason | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState<GeolocationErrorReason | null>(null);

  const geocodeReqIdRef = useRef(0);
  const placesReqIdRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onReverseGeocodedRef = useRef(onReverseGeocoded);
  onReverseGeocodedRef.current = onReverseGeocoded;

  const cancelPendingPlaces = useCallback(() => {
    placesReqIdRef.current += 1;
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setPlaceSuggestions([]);
    setIsSearchingPlaces(false);
    setPlacesSearchedOnce(false);
  }, []);

  useEffect(() => {
    if (isOpen) return;
    geocodeReqIdRef.current += 1;
    cancelPendingPlaces();
    setIsReverseGeocoding(false);
    setGeocodeError(null);
    setIsLocating(false);
    setGeolocationError(null);
  }, [isOpen, cancelPendingPlaces]);

  const searchPlaces = useCallback(
    (query: string, center: GeoCoordinates = APP_CONFIG.defaultCoordinates) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        cancelPendingPlaces();
        return;
      }

      const reqId = ++placesReqIdRef.current;
      setIsSearchingPlaces(true);
      setPlacesSearchedOnce(false);
      searchTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchPlacesAutocomplete(trimmed, center);
          if (reqId !== placesReqIdRef.current) return;
          setPlaceSuggestions(results);
          setPlacesSearchedOnce(true);
        } catch {
          if (reqId !== placesReqIdRef.current) return;
          setPlaceSuggestions([]);
          setPlacesSearchedOnce(false);
        } finally {
          if (reqId === placesReqIdRef.current) setIsSearchingPlaces(false);
        }
      }, 240);
    },
    [cancelPendingPlaces],
  );

  const selectPlaceById = useCallback(async (placeId: string): Promise<ResolvedPlaceResult | null> => {
    const reqId = ++geocodeReqIdRef.current;
    setGeocodeError(null);
    setIsReverseGeocoding(true);
    try {
      const resolved = await getPlaceDetailsById(placeId);
      return reqId === geocodeReqIdRef.current ? resolved : null;
    } catch {
      if (reqId === geocodeReqIdRef.current) setGeocodeError('failed');
      return null;
    } finally {
      if (reqId === geocodeReqIdRef.current) setIsReverseGeocoding(false);
    }
  }, []);

  const triggerReverseGeocode = useCallback(async (coords: GeoCoordinates): Promise<boolean> => {
    try {
      const result = await reverseGeocodeCoordinates(coords);
      onReverseGeocodedRef.current(result);
      return true;
    } catch {
      return false;
    }
  }, []);

  const requestCurrentLocation = useCallback((onSuccess: (coords: GeoCoordinates) => void) => {
    setGeolocationError(null);
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeolocationError('unavailable');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onSuccess({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      (err) => {
        setIsLocating(false);
        setGeolocationError(
          err.code === 1 ? 'permission_denied' : err.code === 3 ? 'timeout' : 'unavailable',
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }, []);

  return {
    placeSuggestions,
    isSearchingPlaces,
    placesSearchedOnce,
    isReverseGeocoding,
    geocodeError,
    isLocating,
    geolocationError,
    searchPlaces,
    cancelPendingPlaces,
    selectPlaceById,
    triggerReverseGeocode,
    requestCurrentLocation,
    clearGeolocationError: () => setGeolocationError(null),
    clearGeocodeError: () => setGeocodeError(null),
  };
}
