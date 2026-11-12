'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GeoCoordinates,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import {
  formatDetectedLocationAddress,
  isDetectableLocationInput,
  isResolvableGoogleMapsUrl,
  parseGoogleMapsLocationInput,
} from '@/lib/google-maps-link';
import { locationApiService } from '@/features/booking/services/location-api-service';
import { SavedLocationItem } from '@/components/molecules/location-picker-saved-list';
import { CreateLocationDraft } from './use-location-create-form';

const EMPTY_DRAFT: CreateLocationDraft = {
  name: '',
  address: '',
  contact: '',
  remark: '',
  houseNumber: '',
  streetNumber: '',
};

interface UseLocationPickerParams {
  isOpen: boolean;
  initialCoords: GeoCoordinates;
  selectedAddress: string;
  defaultContact: string;
  savedLocations: SavedLocationItem[];
  onSelect: (location: PickupLocation) => void;
  onClose: () => void;
}

export function useLocationPicker({
  isOpen,
  initialCoords,
  selectedAddress,
  defaultContact,
  savedLocations,
  onSelect,
  onClose,
}: UseLocationPickerParams) {
  const [activeTab, setActiveTab] = useState<'map' | 'saved'>('map');
  const [pinnedCoords, setPinnedCoords] =
    useState<GeoCoordinates>(initialCoords);
  const [pinAddress, setPinAddress] = useState(selectedAddress || '');
  const [linkInput, setLinkInput] = useState('');
  const [suggestions, setSuggestions] = useState<SavedLocationItem[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [detectedStatus, setDetectedStatus] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPickingForNew, setIsPickingForNew] = useState(false);
  const [awaitingAuthSave, setAwaitingAuthSave] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const [createDraft, setCreateDraft] =
    useState<CreateLocationDraft>(EMPTY_DRAFT);
  const prevLocationsRef = useRef(savedLocations);
  const resolveAbortRef = useRef<AbortController | null>(null);

  const detectAndPinInput = useCallback(
    (val: string) => {
      resolveAbortRef.current?.abort();
      setLinkError(null);
      setDetectedStatus(null);

      const direct = parseGoogleMapsLocationInput(val);
      if (direct) {
        setPinnedCoords(direct.coordinates);
        setPinAddress(
          formatDetectedLocationAddress(direct.coordinates, direct.label),
        );
        setSuggestions([]);
        setIsResolvingLink(false);
        setDetectedStatus(
          `Pinned ${direct.coordinates.lat.toFixed(5)}, ${direct.coordinates.lng.toFixed(5)} on map`,
        );
        return;
      }

      if (isResolvableGoogleMapsUrl(val)) {
        setSuggestions([]);
        setIsResolvingLink(true);
        const controller = new AbortController();
        resolveAbortRef.current = controller;

        locationApiService.resolveGoogleMapsLink(val, controller.signal)
          .then((res) => {
            if (controller.signal.aborted) return;
            setPinnedCoords(res.coordinates);
            setPinAddress(res.address);
            setDetectedStatus(
              `Pinned ${res.coordinates.lat.toFixed(5)}, ${res.coordinates.lng.toFixed(5)} from Google Maps`,
            );
          })
          .catch((err: unknown) => {
            if (controller.signal.aborted) return;
            setLinkError(
              err instanceof Error
                ? err.message
                : 'Unable to resolve Google Maps link.',
            );
          })
          .finally(() => {
            if (!controller.signal.aborted) setIsResolvingLink(false);
          });
        return;
      }

      setIsResolvingLink(false);
      if (val.trim().length >= 2) {
        const q = val.trim().toLowerCase();
        setSuggestions(
          savedLocations
            .filter((loc) =>
              [loc.name, loc.address, loc.tag, loc.riderNote]
                .filter(Boolean)
                .some((f) => f!.toLowerCase().includes(q)),
            )
            .slice(0, 4),
        );
        setPinAddress(val);
      } else {
        setSuggestions([]);
        if (val.trim()) setPinAddress(val);
      }
    },
    [savedLocations],
  );

  useEffect(() => {
    if (!isOpen) {
      resolveAbortRef.current?.abort();
      return;
    }

    const trimmedAddress = selectedAddress?.trim() || '';
    setActiveTab('map');
    setPinnedCoords(initialCoords);
    setPinAddress(trimmedAddress);
    setLinkInput(trimmedAddress);
    setSuggestions([]);
    setIsResolvingLink(false);
    setDetectedStatus(null);
    setLinkError(null);
    setIsCreating(false);
    setIsPickingForNew(false);
    setAwaitingAuthSave(false);
    setHighlightedId(undefined);
    setCreateDraft({ ...EMPTY_DRAFT, contact: defaultContact });

    if (trimmedAddress && isDetectableLocationInput(trimmedAddress)) {
      detectAndPinInput(trimmedAddress);
    }

    return () => {
      resolveAbortRef.current?.abort();
    };
  }, [
    isOpen,
    initialCoords.lat,
    initialCoords.lng,
    selectedAddress,
    defaultContact,
    detectAndPinInput,
  ]);

  useEffect(() => {
    if (awaitingAuthSave && savedLocations !== prevLocationsRef.current) {
      setHighlightedId(savedLocations[0]?.id);
      setIsCreating(false);
      setIsPickingForNew(false);
      setAwaitingAuthSave(false);
    }
    prevLocationsRef.current = savedLocations;
  }, [awaitingAuthSave, savedLocations]);

  const handleLinkChange = (val: string) => {
    setLinkInput(val);
    detectAndPinInput(val);
  };

  const clearLinkInput = () => {
    resolveAbortRef.current?.abort();
    setLinkInput('');
    setSuggestions([]);
    setIsResolvingLink(false);
    setDetectedStatus(null);
    setLinkError(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    setLinkError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        };
        const addr = `Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}), Phnom Penh`;
        setPinnedCoords(coords);
        setPinAddress(addr);
        setLinkInput('');
        setDetectedStatus(
          `Pinned current GPS (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
        );
        if (isCreating) {
          setCreateDraft((prev) => ({
            ...prev,
            address: prev.address.trim() ? prev.address : addr,
          }));
        }
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleConfirmPin = () => {
    const finalAddress =
      pinAddress.trim() ||
      `Google Pin (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)}), Phnom Penh`;

    if (isPickingForNew) {
      setCreateDraft((prev) => ({
        ...prev,
        address: prev.address.trim() ? prev.address : finalAddress,
      }));
      setIsPickingForNew(false);
      setActiveTab('saved');
      return;
    }

    onSelect({
      name: finalAddress.split(',')[0] || 'Google Pinned Location',
      address: finalAddress,
      coordinates: pinnedCoords,
    });
    onClose();
  };

  const handleOpenCreate = (fromPin = false) => {
    setCreateDraft({
      ...EMPTY_DRAFT,
      name: fromPin && pinAddress ? pinAddress.split(',')[0] || '' : '',
      address: fromPin ? pinAddress : '',
      contact: defaultContact,
    });
    setIsCreating(true);
    setIsPickingForNew(false);
    setActiveTab('saved');
  };

  return {
    activeTab,
    setActiveTab,
    pinnedCoords,
    setPinnedCoords,
    pinAddress,
    setPinAddress,
    linkInput,
    setLinkInput,
    suggestions,
    setSuggestions,
    isLocating,
    isResolvingLink,
    detectedStatus,
    setDetectedStatus,
    linkError,
    isCreating,
    setIsCreating,
    isPickingForNew,
    setIsPickingForNew,
    setAwaitingAuthSave,
    highlightedId,
    setHighlightedId,
    createDraft,
    setCreateDraft,
    handleLinkChange,
    clearLinkInput,
    handleUseCurrentLocation,
    handleConfirmPin,
    handleOpenCreate,
  };
}
