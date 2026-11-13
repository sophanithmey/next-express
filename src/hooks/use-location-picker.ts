'use client';

import { useCallback, useEffect, useState } from 'react';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { SavedLocationItem } from '@/components/molecules/location-picker-saved-list';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import {
  PlaceSuggestion,
  GeocodingServiceError,
  isValidGeoCoordinates,
} from '@/features/booking/services/geocoding-service';
import { useLocationGeocoder } from '@/features/booking/hooks/use-location-geocoder';
import { useLocationPickerSaved } from '@/features/booking/hooks/use-location-picker-saved';
import { useLocationLinkResolver } from '@/features/booking/hooks/use-location-link-resolver';
import { APP_CONFIG } from '@/lib/constants';

export interface QuickLocationChip {
  name: string;
  address: string;
  coords: GeoCoordinates;
}

interface UseLocationPickerParams {
  isOpen: boolean;
  initialCoords?: GeoCoordinates;
  selectedAddress: string;
  savedLocations: SavedLocationItem[];
  defaultContact?: string;
  onSelect: (location: PickupLocation) => void;
  onClose: () => void;
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

export function useLocationPicker({
  isOpen,
  initialCoords,
  selectedAddress,
  savedLocations,
  defaultContact = '',
  onSelect,
  onClose,
  onCreateLocation,
}: UseLocationPickerParams) {
  const safeInitial =
    initialCoords && isValidGeoCoordinates(initialCoords)
      ? initialCoords
      : APP_CONFIG.defaultCoordinates;

  const [activeTab, setActiveTab] = useState<'map' | 'saved'>('map');
  const [pinnedCoords, setPinnedCoords] = useState<GeoCoordinates>(safeInitial);
  const [pinAddress, setPinAddress] = useState(selectedAddress || '');
  const [selectedName, setSelectedName] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(undefined);

  const saved = useLocationPickerSaved({
    isOpen,
    defaultContact,
    onSelect,
    onClose,
    onCreateLocation,
  });

  const geocoder = useLocationGeocoder({
    isOpen,
    onReverseGeocoded: ({ address, placeId }) => {
      setPinAddress(address);
      setSelectedName(address.split(',')[0]?.trim() || '');
      if (placeId) setSelectedPlaceId(placeId);
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const nextCoords =
      initialCoords && isValidGeoCoordinates(initialCoords)
        ? initialCoords
        : APP_CONFIG.defaultCoordinates;
    setActiveTab('map');
    setPinnedCoords(nextCoords);
    setPinAddress(selectedAddress || '');
    setSelectedName(selectedAddress ? selectedAddress.split(',')[0]?.trim() || '' : '');
    setSelectedPlaceId(undefined);
  }, [isOpen, initialCoords, selectedAddress]);

  const applyCoordinatePin = useCallback(
    async (coords: GeoCoordinates, presetAddress?: string) => {
      setPinnedCoords(coords);
      setSelectedPlaceId(undefined);
      geocoder.clearGeolocationError();
      if (presetAddress) {
        setPinAddress(presetAddress);
        setSelectedName(presetAddress.split(',')[0]?.trim() || '');
        geocoder.clearGeocodeError();
        return;
      }
      setPinAddress((prev) => {
        if (
          !prev.trim() ||
          /^\d+\.\d+,\s*\d+\.\d+/.test(prev) ||
          prev.startsWith('Pinned Location') ||
          prev.startsWith('Google Pin')
        ) {
          return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}, Phnom Penh`;
        }
        return prev;
      });
    },
    [geocoder],
  );

  const linkResolver = useLocationLinkResolver({
    isOpen,
    pinnedCoords,
    savedLocations,
    onApplyPin: applyCoordinatePin,
    onSearchPlaces: geocoder.searchPlaces,
    onCancelPlaces: geocoder.cancelPendingPlaces,
  });

  const handleSelectPlace = useCallback(
    async (prediction: PlaceSuggestion) => {
      geocoder.cancelPendingPlaces();
      linkResolver.setSavedSuggestions([]);
      linkResolver.setLinkInput(prediction.description);
      linkResolver.setLinkError(null);
      linkResolver.setDetectedStatus(null);
      try {
        const resolved = await geocoder.selectPlaceById(prediction.placeId);
        if (!resolved) return;
        setPinnedCoords(resolved.coordinates);
        setPinAddress(resolved.address);
        setSelectedName(resolved.name);
        setSelectedPlaceId(resolved.placeId);
      } catch (err) {
        if (err instanceof GeocodingServiceError) linkResolver.setLinkError(err.message);
      }
    },
    [geocoder, linkResolver],
  );

  const handleUseCurrentLocation = useCallback(() => {
    geocoder.requestCurrentLocation((coords) => {
      setPinnedCoords(coords);
      setSelectedPlaceId(undefined);
      linkResolver.setSavedSuggestions([]);
      const fallback = `Current Location (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}), Phnom Penh`;
      setPinAddress((prev) =>
        !prev.trim() || /^\d+\.\d+,\s*\d+\.\d+/.test(prev) || prev.startsWith('Current Location')
          ? fallback
          : prev,
      );
      setSelectedName('Current Location');
    });
  }, [geocoder, linkResolver]);

  const handleConfirmPin = useCallback(() => {
    const finalAddress =
      pinAddress.trim() || `${pinnedCoords.lat.toFixed(5)}, ${pinnedCoords.lng.toFixed(5)}, Phnom Penh`;
    const finalName = selectedName || finalAddress.split(',')[0]?.trim() || 'Pinned Location';
    if (saved.isPickingForNew) {
      saved.setCreateDraft((prev) => ({ ...prev, address: finalAddress }));
      saved.setIsPickingForNew(false);
      setActiveTab('saved');
      return;
    }
    onSelect({
      name: finalName,
      address: finalAddress,
      coordinates: { lat: Number(pinnedCoords.lat.toFixed(6)), lng: Number(pinnedCoords.lng.toFixed(6)) },
      placeId: selectedPlaceId,
    });
    onClose();
  }, [onClose, onSelect, pinAddress, pinnedCoords, saved, selectedName, selectedPlaceId]);

  return {
    activeTab,
    setActiveTab,
    pinnedCoords,
    pinAddress,
    setPinAddress: (value: string) => {
      setPinAddress(value);
      geocoder.clearGeocodeError();
    },
    ...linkResolver,
    ...geocoder,
    ...saved,
    handleSelectPlace,
    handleSelectSavedSuggestion: (loc: SavedLocationItem) => {
      const next = saved.previewOnMapState(loc);
      setPinnedCoords(next.coords);
      setPinAddress(next.address);
      setSelectedName(next.name);
      setSelectedPlaceId(next.placeId);
      linkResolver.setSavedSuggestions([]);
      linkResolver.setLinkInput('');
    },
    handleSelectChip: (chip: QuickLocationChip) => {
      geocoder.cancelPendingPlaces();
      linkResolver.setSavedSuggestions([]);
      setPinnedCoords(chip.coords);
      setPinAddress(chip.address);
      setSelectedName(chip.name);
      setSelectedPlaceId(undefined);
      geocoder.clearGeocodeError();
      geocoder.clearGeolocationError();
    },
    handleMapCoordinateSelect: (coords: GeoCoordinates) => void applyCoordinatePin(coords),
    nudgePin: (dLat: number, dLng: number) =>
      void applyCoordinatePin({
        lat: Number((pinnedCoords.lat + dLat).toFixed(6)),
        lng: Number((pinnedCoords.lng + dLng).toFixed(6)),
      }),
    handleUseCurrentLocation,
    handleConfirmPin,
    handlePreviewOnMap: (loc: SavedLocationItem) => {
      const next = saved.previewOnMapState(loc);
      setPinnedCoords(next.coords);
      setPinAddress(next.address);
      setSelectedName(next.name);
      setSelectedPlaceId(next.placeId);
      setActiveTab('map');
    },
    handleOpenCreate: () => {
      saved.handleOpenCreate(pinAddress);
      setActiveTab('saved');
    },
  };
}
