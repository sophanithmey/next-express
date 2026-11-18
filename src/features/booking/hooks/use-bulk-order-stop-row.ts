'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
} from '../types/booking-types';
import { formatPhoneNumber } from '@/lib/phone-number';
import { focusFieldById } from '@/lib/dom-helpers';

interface UseBulkOrderStopRowParams {
  stop: DropoffStop;
  onChange: (updated: DropoffStop) => void;
  phoneError?: string;
  addressError?: string;
  codError?: string;
}

/**
 * Manages inline edit mode, optional field pill toggles, derived display values,
 * and update handlers for a single BulkOrderStopRow.
 */
export function useBulkOrderStopRow({
  stop,
  onChange,
  phoneError,
  addressError,
  codError,
}: UseBulkOrderStopRowParams) {
  const isBlank =
    !stop.recipient.phoneNumber?.trim() || !stop.dropoff.address?.trim();
  const hasError = Boolean(phoneError || addressError || codError);

  const [isEditing, setIsEditing] = useState(isBlank);
  const [showCod, setShowCod] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const showEditor = isEditing || isBlank || hasError;
  const canFinishEditing = !isBlank && !hasError;
  const idPrefix = `bulk-${stop.id}`;
  const isCodOpen = showCod || Boolean(codError);
  const resolvedImage =
    'imageUrl' in stop.recipient ? stop.recipient.imageUrl : stop.imageUrl;

  const formattedPhone = useMemo(
    () => formatPhoneNumber(stop.recipient.phoneNumber, 'national'),
    [stop.recipient.phoneNumber],
  );
  const hasCod = typeof stop.codAmount === 'number' && stop.codAmount > 0;
  const hasNote = Boolean(stop.recipient.notes?.trim());

  const openEditor = useCallback(() => setIsEditing(true), []);
  const closeEditor = useCallback(() => setIsEditing(false), []);

  const handleUpdate = useCallback(
    (
      recipient: RecipientInfo,
      dropoff: DropoffLocation,
      codAmount?: number,
    ) => {
      onChange({
        ...stop,
        recipient,
        dropoff,
        ...(codAmount !== undefined ? { codAmount } : {}),
      });
    },
    [stop, onChange],
  );

  const handleAddressChange = useCallback(
    (address: string) => {
      handleUpdate(stop.recipient, { ...stop.dropoff, address });
    },
    [handleUpdate, stop.recipient, stop.dropoff],
  );

  const handlePhoneChange = useCallback(
    (phoneNumber: string) => {
      handleUpdate({ ...stop.recipient, phoneNumber }, stop.dropoff);
    },
    [handleUpdate, stop.recipient, stop.dropoff],
  );

  const toggleCod = useCallback(() => {
    const next = !isCodOpen;
    setShowCod(next);
    if (next) focusFieldById(`${idPrefix}-cod`);
  }, [isCodOpen, idPrefix]);

  const toggleName = useCallback(() => {
    setShowName((prev) => {
      const next = !prev;
      if (next) focusFieldById(`${idPrefix}-name`);
      return next;
    });
  }, [idPrefix]);

  const toggleNote = useCallback(() => {
    setShowNote((prev) => {
      const next = !prev;
      if (next) focusFieldById(`${idPrefix}-note`);
      return next;
    });
  }, [idPrefix]);

  return {
    idPrefix,
    showEditor,
    canFinishEditing,
    isCodOpen,
    showName,
    showNote,
    resolvedImage,
    formattedPhone,
    hasCod,
    hasNote,
    openEditor,
    closeEditor,
    handleUpdate,
    handleAddressChange,
    handlePhoneChange,
    toggleCod,
    toggleName,
    toggleNote,
  };
}
