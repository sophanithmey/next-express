'use client';

import { useCallback, useEffect, useState } from 'react';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { SavedLocationItem } from '@/components/molecules/location-picker-saved-list';
import { CreateLocationDraft } from '@/components/molecules/location-picker-create-form';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';

const createEmptyDraft = (defaultContact: string): CreateLocationDraft => ({
  name: '',
  address: '',
  contact: defaultContact,
  remark: '',
  houseNumber: '',
  streetNumber: '',
});

interface UseLocationPickerSavedOptions {
  isOpen: boolean;
  defaultContact: string;
  onSelect: (location: PickupLocation) => void;
  onClose: () => void;
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

export function useLocationPickerSaved({
  isOpen,
  defaultContact,
  onSelect,
  onClose,
  onCreateLocation,
}: UseLocationPickerSavedOptions) {
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [isPickingForNew, setIsPickingForNew] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateLocationDraft>(() =>
    createEmptyDraft(defaultContact),
  );

  useEffect(() => {
    if (!isOpen) return;
    setHighlightedId(undefined);
    setIsCreating(false);
    setIsPickingForNew(false);
    setCreateDraft(createEmptyDraft(defaultContact));
  }, [isOpen, defaultContact]);

  const handleOpenCreate = useCallback(
    (initialAddress: string) => {
      setCreateDraft({ ...createEmptyDraft(defaultContact), address: initialAddress });
      setIsCreating(true);
    },
    [defaultContact],
  );

  const handleCreateSubmit = useCallback(
    async (input: CreateSavedLocationInput) => {
      if (!onCreateLocation) return 'auth_required' as const;
      const result = await onCreateLocation(input);
      if (result === 'auth_required') return result;
      onSelect(result);
      onClose();
      return result;
    },
    [onClose, onCreateLocation, onSelect],
  );

  const previewOnMapState = useCallback(
    (loc: SavedLocationItem): { coords: GeoCoordinates; address: string; name: string; placeId?: string } => {
      setHighlightedId(loc.id);
      return {
        coords: loc.coordinates,
        address: loc.address,
        name: loc.name,
        placeId: loc.placeId,
      };
    },
    [],
  );

  return {
    highlightedId,
    setHighlightedId,
    isCreating,
    setIsCreating,
    isPickingForNew,
    setIsPickingForNew,
    createDraft,
    setCreateDraft,
    handleOpenCreate,
    handleCreateSubmit,
    previewOnMapState,
  };
}

