'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { SavedPickupPills } from '@/features/booking/components/saved-pickup-pills';
import { usePickupFieldsState } from '@/features/booking/hooks/use-pickup-fields-state';
import { User, FileText, Camera, Landmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Label } from '../atoms/label';
import { PhoneInput } from './phone-input';
import { OptionalFieldPills, OptionalFieldPill } from './optional-field-pills';
import { PickupOptionalDrawer } from './pickup-optional-drawer';
import { PickupAddressField } from './pickup-address-field';

interface PickupFieldsProps {
  idPrefix: string;
  pickup: PickupLocation;
  onChange: (pickup: PickupLocation) => void;
  onOpenMap: () => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
  isCod?: boolean;
  defaultBankOpen?: boolean;
  savedLocations?: (PickupLocation & { tag?: string })[];
  addressError?: string;
  phoneError?: string;
  bankNameError?: string;
  bankNumberError?: string;
}

/**
 * Progressive-disclosure pickup form prioritizing required Address and Phone,
 * with toggleable Wing Bank Account (required when COD), Name, and Note/Photo drawers.
 */
export function PickupFields({
  idPrefix,
  pickup,
  onChange,
  onOpenMap,
  onUseCurrentLocation,
  isLocating = false,
  isCod = false,
  defaultBankOpen = false,
  savedLocations,
  addressError,
  phoneError,
  bankNameError,
  bankNumberError,
}: PickupFieldsProps) {
  const tPickup = useTranslations('Pickup');
  const addressId = `${idPrefix}-address`;
  const phoneId = `${idPrefix}-phone`;

  const {
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
  } = usePickupFieldsState({ idPrefix, pickup, isCod, defaultBankOpen, bankNameError, bankNumberError });

  const bankChipLabel = hasBankAccount
    ? `${trimmedBankName} · ${trimmedBankNumber}`
    : isCod
      ? tPickup('addWingBankRequiredChip')
      : tPickup('addWingBankChip');

  const wingBankButtonClasses =
    'border-wing-bank bg-wing-bank text-white hover:bg-wing-bank-hover hover:border-wing-bank-hover font-semibold shadow-2xs';

  const optionalPills: OptionalFieldPill[] = [
    {
      key: 'wingBank',
      label: bankChipLabel,
      icon: <Landmark className="h-3.5 w-3.5 shrink-0" />,
      isOpen: isBankOpen,
      hasValue: hasBankAccount,
      idleClasses: wingBankButtonClasses,
      openClasses: `${wingBankButtonClasses} ring-2 ring-wing-bank/25`,
      filledClasses: wingBankButtonClasses,
      onToggle: handleToggleBank,
    },
    {
      key: 'name',
      label: hasName ? trimmedName : tPickup('addNameChip'),
      icon: <User className="h-3.5 w-3.5 shrink-0" />,
      isOpen: showName,
      hasValue: hasName,
      onToggle: handleToggleName,
    },
    {
      key: 'note',
      label: hasAttachment ? tPickup('noteChip') : tPickup('addNoteChip'),
      icon: <FileText className="h-3.5 w-3.5 shrink-0" />,
      isOpen: showNote,
      hasValue: hasAttachment,
      extraBadge: pickup.imageUrl ? <Camera className="h-3 w-3 shrink-0 text-brand-600" /> : undefined,
      onToggle: handleToggleNote,
    },
  ];

  return (
    <div className="space-y-3.5">
      {savedLocations && savedLocations.length > 0 && (
        <SavedPickupPills
          locations={savedLocations}
          selectedAddress={pickup.address}
          onSelect={(loc) =>
            onChange({
              ...loc,
              senderPhone: loc.senderPhone || pickup.senderPhone,
              senderName: loc.senderName ?? pickup.senderName,
              settlementBank: loc.settlementBank ?? pickup.settlementBank,
              settlementAccountName:
                loc.settlementAccountName ?? pickup.settlementAccountName,
              settlementAccountNumber:
                loc.settlementAccountNumber ?? pickup.settlementAccountNumber,
            })
          }
        />
      )}

      {/* Row 1: Required Pickup Address + Current GPS & Map Pin Trigger */}
      <PickupAddressField
        addressId={addressId}
        pickup={pickup}
        onChange={onChange}
        onOpenMap={onOpenMap}
        onUseCurrentLocation={onUseCurrentLocation}
        isLocating={isLocating}
        addressError={addressError}
      />

      {/* Row 2: Required Contact Phone + 1-Click Optional Pills */}
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor={phoneId} required>
            {tPickup('senderPhone')}
          </Label>
          <PhoneInput
            id={phoneId}
            placeholder="012 888 999"
            value={pickup.senderPhone || ''}
            onChange={(e) => onChange({ ...pickup, senderPhone: e.target.value })}
            error={phoneError}
            sizeVariant="md"
          />
        </div>
        <OptionalFieldPills pills={optionalPills} />
      </div>

      {/* Row 3: Progressive Optional Fields Drawer */}
      <PickupOptionalDrawer
        idPrefix={idPrefix}
        pickup={pickup}
        isNameOpen={showName}
        isNoteOpen={showNote}
        isBankOpen={isBankOpen}
        isCodRequired={isCod}
        bankNameError={bankNameError}
        bankNumberError={bankNumberError}
        onChange={onChange}
      />
    </div>
  );
}
