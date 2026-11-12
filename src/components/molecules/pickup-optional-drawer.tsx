'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { RiderNoteInput } from './rider-note-input';
import { WingBankAccountFields } from './wing-bank-account-fields';

interface PickupOptionalDrawerProps {
  idPrefix: string;
  pickup: PickupLocation;
  isNameOpen: boolean;
  isNoteOpen: boolean;
  isBankOpen?: boolean;
  isCodRequired?: boolean;
  bankNameError?: string;
  bankNumberError?: string;
  onChange: (pickup: PickupLocation) => void;
}

/**
 * Progressive-disclosure drawer rendering pickup Wing Bank, Name, and Note/Photo inputs when expanded.
 */
export function PickupOptionalDrawer({
  idPrefix,
  pickup,
  isNameOpen,
  isNoteOpen,
  isBankOpen = false,
  isCodRequired = false,
  bankNameError,
  bankNumberError,
  onChange,
}: PickupOptionalDrawerProps) {
  const tPickup = useTranslations('Pickup');

  if (!isNameOpen && !isNoteOpen && !isBankOpen) {
    return null;
  }

  const nameId = `${idPrefix}-name`;
  const noteId = `${idPrefix}-note`;

  return (
    <div className='pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150'>
      {isBankOpen && (
        <WingBankAccountFields
          idPrefix={idPrefix}
          settlementBank={pickup.settlementBank}
          accountName={pickup.settlementAccountName}
          accountNumber={pickup.settlementAccountNumber}
          isRequired={isCodRequired}
          accountNameError={bankNameError}
          accountNumberError={bankNumberError}
          onChange={(updates) => onChange({ ...pickup, ...updates })}
        />
      )}

      {isNameOpen && (
        <div className='space-y-1'>
          <Label htmlFor={nameId} optional>
            {tPickup('senderName')}
          </Label>
          <Input
            id={nameId}
            placeholder={tPickup('senderNamePlaceholder')}
            value={pickup.senderName || ''}
            onChange={(e) =>
              onChange({ ...pickup, senderName: e.target.value })
            }
            leftIcon={<User className='h-4 w-4 text-slate-400' />}
            sizeVariant='md'
          />
        </div>
      )}

      {isNoteOpen && (
        <RiderNoteInput
          id={noteId}
          label={tPickup('riderNoteLabel')}
          placeholder={tPickup('riderNotePlaceholder')}
          noteValue={pickup.riderNote || ''}
          imageValue={pickup.imageUrl}
          onChangeNote={(note) => onChange({ ...pickup, riderNote: note })}
          onChangeImage={(img) => onChange({ ...pickup, imageUrl: img })}
        />
      )}
    </div>
  );
}
