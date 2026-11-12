'use client';

import { useState } from 'react';
import { PickupLocation } from '../types/booking-types';
import { focusFieldById } from '@/lib/dom-helpers';

interface UsePickupFieldsStateParams {
  idPrefix: string;
  pickup: PickupLocation;
  isCod: boolean;
  defaultBankOpen: boolean;
  bankNameError?: string;
  bankNumberError?: string;
}

/**
 * Manages progressive-disclosure toggle state and derived flags for PickupFields.
 */
export function usePickupFieldsState({
  idPrefix,
  pickup,
  isCod,
  defaultBankOpen,
  bankNameError,
  bankNumberError,
}: UsePickupFieldsStateParams) {
  const [showName, setShowName] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [manualBankOpen, setManualBankOpen] = useState<boolean | null>(
    defaultBankOpen ? true : null
  );

  const trimmedName = pickup.senderName?.trim() || '';
  const hasName = Boolean(trimmedName);
  const hasAttachment = Boolean(pickup.riderNote?.trim() || pickup.imageUrl);
  const trimmedBankName = pickup.settlementAccountName?.trim() || '';
  const trimmedBankNumber = pickup.settlementAccountNumber?.trim() || '';
  const hasBankAccount = Boolean(trimmedBankName && trimmedBankNumber);
  const hasAnyBankInput = Boolean(trimmedBankName || trimmedBankNumber);
  const hasBankErrors = Boolean(bankNameError || bankNumberError);
  const isBankOpen =
    hasBankErrors ||
    (manualBankOpen !== null ? manualBankOpen : Boolean(isCod || hasAnyBankInput));

  const handleToggleName = () => {
    const next = !showName;
    setShowName(next);
    if (next) focusFieldById(`${idPrefix}-name`);
  };

  const handleToggleNote = () => {
    const next = !showNote;
    setShowNote(next);
    if (next) focusFieldById(`${idPrefix}-note`);
  };

  const handleToggleBank = () => {
    const next = !isBankOpen;
    setManualBankOpen(next);
    if (next) focusFieldById(`${idPrefix}-wing-account-name`);
  };

  return {
    showName,
    showNote,
    isBankOpen,
    trimmedName,
    hasName,
    hasAttachment,
    trimmedBankName,
    trimmedBankNumber,
    hasBankAccount,
    handleToggleName,
    handleToggleNote,
    handleToggleBank,
  };
}

