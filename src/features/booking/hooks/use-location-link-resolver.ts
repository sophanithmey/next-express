'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { SavedLocationItem } from '@/components/molecules/location-picker-saved-list';
import { locationApiService } from '@/features/booking/services/location-api-service';
import { isResolvableGoogleMapsUrl, parseGoogleMapsLocationInput } from '@/lib/google-maps-link';

interface UseLocationLinkResolverOptions {
  isOpen: boolean;
  pinnedCoords: GeoCoordinates;
  savedLocations: SavedLocationItem[];
  onApplyPin: (coords: GeoCoordinates, presetAddress?: string) => void | Promise<void>;
  onSearchPlaces: (query: string, center: GeoCoordinates) => void;
  onCancelPlaces: () => void;
}

export function useLocationLinkResolver({
  isOpen,
  pinnedCoords,
  savedLocations,
  onApplyPin,
  onSearchPlaces,
  onCancelPlaces,
}: UseLocationLinkResolverOptions) {
  const [linkInput, setLinkInput] = useState('');
  const [savedSuggestions, setSavedSuggestions] = useState<SavedLocationItem[]>([]);
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [detectedStatus, setDetectedStatus] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkReqIdRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    linkReqIdRef.current += 1;
    setLinkInput('');
    setSavedSuggestions([]);
    setIsResolvingLink(false);
    setDetectedStatus(null);
    setLinkError(null);
  }, [isOpen]);

  const clearLinkInput = useCallback(() => {
    linkReqIdRef.current += 1;
    setLinkInput('');
    setSavedSuggestions([]);
    setLinkError(null);
    setDetectedStatus(null);
    onCancelPlaces();
  }, [onCancelPlaces]);

  const handleLinkChange = useCallback(
    async (raw: string) => {
      setLinkInput(raw);
      setLinkError(null);
      setDetectedStatus(null);
      const q = raw.trim().toLowerCase();
      setSavedSuggestions(
        q.length >= 2
          ? savedLocations
              .filter((loc) =>
                [loc.name, loc.address, loc.tag]
                  .filter(Boolean)
                  .some((f) => f!.toLowerCase().includes(q)),
              )
              .slice(0, 4)
          : [],
      );

      const parsed = parseGoogleMapsLocationInput(raw);
      if (parsed) {
        onCancelPlaces();
        setDetectedStatus(`${parsed.coordinates.lat.toFixed(5)}, ${parsed.coordinates.lng.toFixed(5)}`);
        await onApplyPin(parsed.coordinates, parsed.label);
        return;
      }

      if (isResolvableGoogleMapsUrl(raw)) {
        onCancelPlaces();
        const reqId = ++linkReqIdRef.current;
        setIsResolvingLink(true);
        try {
          const resolved = await locationApiService.resolveGoogleMapsLink(raw);
          if (reqId !== linkReqIdRef.current) return;
          setDetectedStatus(`${resolved.coordinates.lat.toFixed(5)}, ${resolved.coordinates.lng.toFixed(5)}`);
          await onApplyPin(
            resolved.coordinates,
            resolved.address || resolved.placeName,
          );
        } catch (err) {
          if (reqId === linkReqIdRef.current) {
            setLinkError(err instanceof Error ? err.message : 'Unable to extract coordinates.');
          }
        } finally {
          if (reqId === linkReqIdRef.current) setIsResolvingLink(false);
        }
        return;
      }

      onSearchPlaces(raw, pinnedCoords);
    },
    [onApplyPin, onCancelPlaces, onSearchPlaces, pinnedCoords, savedLocations],
  );

  return {
    linkInput,
    setLinkInput,
    savedSuggestions,
    setSavedSuggestions,
    isResolvingLink,
    detectedStatus,
    setDetectedStatus,
    linkError,
    setLinkError,
    handleLinkChange,
    clearLinkInput,
  };
}
