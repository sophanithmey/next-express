'use client';

import React, { useState } from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { SavedPickupPills } from '@/features/booking/components/saved-pickup-pills';
import { MapPin, LocateFixed, Loader2, User, FileText, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { PhoneInput } from './phone-input';
import { OptionalFieldPills, OptionalFieldPill } from './optional-field-pills';
import { PickupOptionalDrawer } from './pickup-optional-drawer';
import { focusFieldById } from '@/lib/dom-helpers';
import { isDetectableLocationInput } from '@/lib/google-maps-link';

interface PickupFieldsProps {
  idPrefix: string;
  pickup: PickupLocation;
  onChange: (pickup: PickupLocation) => void;
  onOpenMap: () => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
  savedLocations?: (PickupLocation & { tag?: string })[];
  addressError?: string;
  phoneError?: string;
}

/**
 * Progressive-disclosure pickup form prioritizing the two required fields
 * (Pickup Address and Contact Phone) and tucking optional Name and Note/Photo into 1-click pills.
 */
export function PickupFields({
  idPrefix,
  pickup,
  onChange,
  onOpenMap,
  onUseCurrentLocation,
  isLocating = false,
  savedLocations,
  addressError,
  phoneError,
}: PickupFieldsProps) {
  const tPickup = useTranslations('Pickup');
  const [showName, setShowName] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const addressId = `${idPrefix}-address`;
  const phoneId = `${idPrefix}-phone`;
  const trimmedName = pickup.senderName?.trim() || '';
  const hasName = Boolean(trimmedName);
  const hasAttachment = Boolean(pickup.riderNote?.trim() || pickup.imageUrl);

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

  const optionalPills: OptionalFieldPill[] = [
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
      extraBadge: pickup.imageUrl ? (
        <Camera className="h-3 w-3 shrink-0 text-brand-600" />
      ) : undefined,
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
            })
          }
        />
      )}

      {/* Row 1: Required Pickup Address + Current GPS & Map Pin Trigger */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={addressId} required>
            {tPickup('addressLabel')}
          </Label>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer transition select-none disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin text-brand-600" />
            ) : (
              <LocateFixed className="h-3 w-3 text-brand-600" />
            )}
            <span>{isLocating ? tPickup('locating') : tPickup('useCurrentLocation')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Input
              id={addressId}
              placeholder={tPickup('addressPlaceholder')}
              value={pickup.address}
              onChange={(e) =>
                onChange({
                  ...pickup,
                  address: e.target.value,
                  name: e.target.value.split(',')[0] || 'My Location',
                })
              }
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text').trim();
                if (pasted && isDetectableLocationInput(pasted)) {
                  e.preventDefault();
                  onChange({
                    ...pickup,
                    address: pasted,
                    name: pasted.split(',')[0] || 'My Location',
                  });
                  onOpenMap();
                }
              }}
              leftIcon={<MapPin className="h-4 w-4 text-brand-600" />}
              error={Boolean(addressError)}
              sizeVariant="md"
            />
          </div>
          <button
            type="button"
            onClick={onOpenMap}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
            title={tPickup('pinOnMap')}
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            <span className="hidden sm:inline">{tPickup('pinOnMap')}</span>
          </button>
        </div>
        {addressError ? (
          <p className="text-xs font-medium text-danger-600">{addressError}</p>
        ) : isDetectableLocationInput(pickup.address) ? (
          <p className="text-xs font-medium text-brand-700">
            Map link or coordinates detected — click Pin on Map to confirm pin location.
          </p>
        ) : null}
      </div>

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
        onChange={onChange}
      />
    </div>
  );
}
