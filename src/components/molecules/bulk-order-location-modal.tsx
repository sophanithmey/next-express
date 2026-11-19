'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DropoffStop, PickupLocation } from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { SavedLocationItem } from './location-picker-saved-list';
import { LocationPickerModal } from './location-picker-modal';
import { applyConfirmedPickupLocation } from '@/features/booking/services/booking-location-helper';

export type BulkMapTarget =
  | { type: 'pickup' }
  | { type: 'stop'; orderId: string; stopIndex: number }
  | null;

interface BulkOrderLocationModalProps {
  mapTarget: BulkMapTarget;
  onClose: () => void;
  pickup: PickupLocation;
  onChangePickup: (pickup: PickupLocation) => void;
  targetStop?: DropoffStop;
  savedLocations?: (PickupLocation & { tag?: string })[];
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
  onUpdateStop: (orderId: string, stopIndex: number, updated: DropoffStop) => void;
}

export function BulkOrderLocationModal({
  mapTarget,
  onClose,
  pickup,
  onChangePickup,
  targetStop,
  savedLocations,
  onCreateLocation,
  onUpdateStop,
}: BulkOrderLocationModalProps) {
  const tPickup = useTranslations('Pickup');
  const tRecipient = useTranslations('Recipient');

  if (!mapTarget) return null;

  return (
    <LocationPickerModal
      isOpen={mapTarget !== null}
      onClose={onClose}
      title={
        mapTarget?.type === 'pickup'
          ? tPickup('selectLocation')
          : tRecipient('destinationIndex', {
              index: (mapTarget?.stopIndex ?? 0) + 1,
            })
      }
      selectedAddress={
        mapTarget?.type === 'pickup'
          ? pickup.address
          : targetStop?.dropoff.address || ''
      }
      initialCoords={
        mapTarget?.type === 'pickup'
          ? pickup.coordinates
          : targetStop?.dropoff.coordinates || pickup.coordinates
      }
      savedLocations={savedLocations}
      defaultContact={mapTarget?.type === 'pickup' ? pickup.senderPhone || '' : ''}
      onCreateLocation={onCreateLocation}
      onSelect={(loc) => {
        if (!mapTarget) return;
        if (mapTarget.type === 'pickup') {
          onChangePickup(applyConfirmedPickupLocation(pickup, loc));
          return;
        }
        if (targetStop) {
          onUpdateStop(mapTarget.orderId, mapTarget.stopIndex, {
            ...targetStop,
            dropoff: {
              ...targetStop.dropoff,
              address: loc.address,
              coordinates: {
                lat: Number(loc.coordinates.lat),
                lng: Number(loc.coordinates.lng),
              },
              placeId: loc.placeId,
            },
          });
        }
      }}
    />
  );
}
