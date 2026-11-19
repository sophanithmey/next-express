'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  BookingFormData,
  DropoffLocation,
  DropoffStop,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { SavedLocationItem } from './location-picker-saved-list';
import { LocationPickerModal } from './location-picker-modal';
import {
  applyConfirmedDropoffLocation,
  applyConfirmedPickupLocation,
} from '@/features/booking/services/booking-location-helper';

interface BookingFormMapModalProps {
  modalMode: 'pickup' | 'dropoff' | null;
  activeStopIndex: number;
  onClose: () => void;
  formData: BookingFormData;
  savedLocations?: (PickupLocation & { tag?: string })[];
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
}

export function BookingFormMapModal({
  modalMode,
  activeStopIndex,
  onClose,
  formData,
  savedLocations,
  onCreateLocation,
  onChangePickup,
  onChangeDropoff,
  onChangeDropoffs,
}: BookingFormMapModalProps) {
  const tPickup = useTranslations('Pickup');
  const tRecipient = useTranslations('Recipient');

  if (!modalMode) return null;

  return (
    <LocationPickerModal
      isOpen={modalMode !== null}
      onClose={onClose}
      title={
        modalMode === 'pickup'
          ? tPickup('selectLocation')
          : tRecipient('destinationIndex', { index: activeStopIndex + 1 })
      }
      selectedAddress={
        modalMode === 'pickup'
          ? formData.pickup.address
          : formData.dropoffs?.[activeStopIndex]?.dropoff.address ||
            formData.dropoff.address
      }
      initialCoords={
        modalMode === 'pickup'
          ? formData.pickup.coordinates
          : formData.dropoffs?.[activeStopIndex]?.dropoff.coordinates ||
            formData.dropoff.coordinates
      }
      savedLocations={savedLocations}
      defaultContact={modalMode === 'pickup' ? formData.pickup.senderPhone || '' : ''}
      onCreateLocation={onCreateLocation}
      onSelect={(loc) => {
        if (modalMode === 'pickup') {
          onChangePickup(applyConfirmedPickupLocation(formData.pickup, loc));
          return;
        }
        const { nextDropoffs, primaryDropoffToSync } =
          applyConfirmedDropoffLocation({
            dropoffs: formData.dropoffs,
            fallbackDropoff: formData.dropoff,
            activeStopIndex,
            selected: loc,
          });
        if (nextDropoffs) {
          onChangeDropoffs?.(nextDropoffs);
        }
        if (primaryDropoffToSync) {
          onChangeDropoff(primaryDropoffToSync);
        }
      }}
    />
  );
}
