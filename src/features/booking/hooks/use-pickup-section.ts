'use client';

import { useState, useEffect, useCallback } from 'react';
import { PickupLocation } from '../types/booking-types';
import { usePickupGeolocation } from './use-pickup-geolocation';

interface UsePickupSectionParams {
  pickup: PickupLocation;
  onChangePickup: (loc: PickupLocation) => void;
  hasValidationError: boolean;
}

/**
 * Manages pickup section edit/compact mode state, bank drawer expansion,
 * and geolocation lookup callbacks for PickupSection.
 */
export function usePickupSection({
  pickup,
  onChangePickup,
  hasValidationError,
}: UsePickupSectionParams) {
  const [isEditing, setIsEditing] = useState(() => !pickup.address?.trim());
  const [openBankOnEdit, setOpenBankOnEdit] = useState(false);

  useEffect(() => {
    if (!pickup.address?.trim()) {
      setIsEditing(true);
    }
  }, [pickup.address]);

  const { isLocating, handleGetCurrentLocation } = usePickupGeolocation(
    (patch) => onChangePickup({ ...pickup, ...patch }),
  );

  const handleDoneEditing = useCallback(() => {
    setOpenBankOnEdit(false);
    setIsEditing(false);
  }, []);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleOpenBankEdit = useCallback(() => {
    setOpenBankOnEdit(true);
    setIsEditing(true);
  }, []);

  return {
    isEditMode: isEditing || hasValidationError,
    openBankOnEdit,
    isLocating,
    handleGetCurrentLocation,
    handleDoneEditing,
    handleStartEditing,
    handleOpenBankEdit,
  };
}

