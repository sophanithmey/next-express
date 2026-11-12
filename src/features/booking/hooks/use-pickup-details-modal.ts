'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PickupLocation } from '../types/booking-types';
import { isValidCambodiaPhoneNumber } from '@/lib/phone-number';
import { isValidWingAccountNumber } from '../services/booking-form-helpers';
import { usePickupGeolocation } from './use-pickup-geolocation';

interface PickupValidationErrors {
  address?: string;
  senderPhone?: string;
  settlementAccountName?: string;
  settlementAccountNumber?: string;
}

/**
 * Manages draft pickup fields, map-pin sync, browser geolocation lookup,
 * and required field validation (including Wing Bank for COD) for PickupDetailsModal.
 */
export function usePickupDetailsModal(
  isOpen: boolean,
  pickup: PickupLocation,
  onSavePickup: (pickup: PickupLocation) => void,
  onClose: () => void,
  isCod = false
) {
  const tValidation = useTranslations('Validation');
  const [draft, setDraft] = useState<PickupLocation>(pickup);
  const [localErrors, setLocalErrors] = useState<PickupValidationErrors>({});
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setDraft(pickup);
      setLocalErrors({});
    } else if (isOpen && wasOpenRef.current) {
      // Sync address/coordinates picked via Map modal without discarding unsaved edits
      setDraft((prev) => {
        const coordsChanged =
          prev.coordinates?.lat !== pickup.coordinates?.lat ||
          prev.coordinates?.lng !== pickup.coordinates?.lng;
        if (prev.address === pickup.address && !coordsChanged) return prev;
        return {
          ...prev,
          name: pickup.name,
          address: pickup.address,
          coordinates: pickup.coordinates,
        };
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, pickup]);

  const clearFieldError = useCallback((field: keyof PickupValidationErrors) => {
    setLocalErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleChangeDraft = useCallback(
    (nextDraft: PickupLocation) => {
      setDraft((prev) => {
        if (nextDraft.address !== prev.address) clearFieldError('address');
        if (nextDraft.senderPhone !== prev.senderPhone) clearFieldError('senderPhone');
        if (nextDraft.settlementAccountName !== prev.settlementAccountName) {
          clearFieldError('settlementAccountName');
        }
        if (nextDraft.settlementAccountNumber !== prev.settlementAccountNumber) {
          clearFieldError('settlementAccountNumber');
        }
        return nextDraft;
      });
    },
    [clearFieldError]
  );

  const { isLocating, handleGetCurrentLocation } = usePickupGeolocation((patch) => {
    clearFieldError('address');
    setDraft((prev) => ({ ...prev, ...patch }));
  });

  const handleSave = useCallback(() => {
    const errors: PickupValidationErrors = {};
    if (!draft.address?.trim() || draft.address.trim().length < 3) {
      errors.address = tValidation('pickupAddressRequired');
    }
    if (!draft.senderPhone?.trim() || !isValidCambodiaPhoneNumber(draft.senderPhone)) {
      errors.senderPhone = tValidation('pickupPhoneInvalid');
    }
    const accountName = draft.settlementAccountName?.trim() ?? '';
    const accountNumber = draft.settlementAccountNumber?.trim() ?? '';
    if (isCod) {
      if (accountName.length < 2) {
        errors.settlementAccountName = tValidation('wingAccountNameRequired');
      }
      if (!isValidWingAccountNumber(accountNumber)) {
        errors.settlementAccountNumber = tValidation('wingAccountNumberInvalid');
      }
    } else if (accountNumber && !isValidWingAccountNumber(accountNumber)) {
      errors.settlementAccountNumber = tValidation('wingAccountNumberInvalid');
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    onSavePickup(draft);
    onClose();
  }, [draft, isCod, tValidation, onSavePickup, onClose]);

  return useMemo(
    () => ({
      draft,
      handleChangeDraft,
      isLocating,
      handleGetCurrentLocation,
      localErrors,
      handleSave,
    }),
    [draft, handleChangeDraft, isLocating, handleGetCurrentLocation, localErrors, handleSave]
  );
}
