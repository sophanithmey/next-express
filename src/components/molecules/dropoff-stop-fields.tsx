'use client';

import React, { useState } from 'react';
import { DropoffLocation, DropoffStop, RecipientInfo } from '@/features/booking/types/booking-types';
import { Navigation, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { PhoneInput } from './phone-input';
import { StopOptionalPills } from './stop-optional-pills';
import { StopOptionalDrawer } from './stop-optional-drawer';
import { focusFieldById } from '@/lib/dom-helpers';
import { isDetectableLocationInput } from '@/lib/google-maps-link';

interface DropoffStopFieldsProps {
  idPrefix: string;
  stop: DropoffStop;
  onUpdate: (
    recipient: RecipientInfo,
    dropoff: DropoffLocation,
    codAmount?: number
  ) => void;
  onOpenMap: () => void;
  phoneError?: string;
  addressError?: string;
  nameError?: string;
  codError?: string;
}

/**
 * Progressive-disclosure drop-off stop form prioritizing the two required fields
 * (Address and Recipient Phone) and tucking Name, COD, and Note/Photo into 1-click pills.
 */
export function DropoffStopFields({
  idPrefix,
  stop,
  onUpdate,
  onOpenMap,
  phoneError,
  addressError,
  nameError,
  codError,
}: DropoffStopFieldsProps) {
  const t = useTranslations('Recipient');
  const [showCod, setShowCod] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const isCodOpen = showCod || Boolean(codError);
  const isNameOpen = showName || Boolean(nameError);
  const isNoteOpen = showNote;

  const addressId = `${idPrefix}-address`;
  const phoneId = `${idPrefix}-phone`;
  const resolvedImage =
    'imageUrl' in stop.recipient ? stop.recipient.imageUrl : stop.imageUrl;

  const handleToggleCod = () => {
    const next = !isCodOpen;
    setShowCod(next);
    if (next) focusFieldById(`${idPrefix}-cod`);
  };

  const handleToggleName = () => {
    const next = !isNameOpen;
    setShowName(next);
    if (next) focusFieldById(`${idPrefix}-name`);
  };

  const handleToggleNote = () => {
    const next = !isNoteOpen;
    setShowNote(next);
    if (next) focusFieldById(`${idPrefix}-note`);
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Required Drop-off Address + Map Pin Trigger */}
      <div className="space-y-1">
        <Label htmlFor={addressId} required>
          {t('addressLabel')}
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Input
              id={addressId}
              placeholder={t('addressPlaceholder')}
              value={stop.dropoff.address}
              onChange={(e) =>
                onUpdate(stop.recipient, { ...stop.dropoff, address: e.target.value })
              }
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text').trim();
                if (pasted && isDetectableLocationInput(pasted)) {
                  e.preventDefault();
                  onUpdate(stop.recipient, { ...stop.dropoff, address: pasted });
                  onOpenMap();
                }
              }}
              leftIcon={<Navigation className="h-4 w-4 text-brand-600" />}
              error={Boolean(addressError)}
              sizeVariant="md"
            />
          </div>
          <button
            type="button"
            onClick={onOpenMap}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
            title={t('pinOnMap')}
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            <span className="hidden sm:inline">{t('pinOnMap')}</span>
          </button>
        </div>
        {addressError ? (
          <p className="text-xs font-medium text-danger-600">{addressError}</p>
        ) : isDetectableLocationInput(stop.dropoff.address) ? (
          <p className="text-xs font-medium text-brand-700">
            Map link or coordinates detected — click Pin on Map to confirm pin location.
          </p>
        ) : null}
      </div>

      {/* Row 2: Required Recipient Phone + 1-Click Optional Pills */}
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor={phoneId} required>
            {t('phoneLabel')}
          </Label>
          <PhoneInput
            id={phoneId}
            placeholder={t('phonePlaceholder')}
            value={stop.recipient.phoneNumber}
            onChange={(e) =>
              onUpdate(
                { ...stop.recipient, phoneNumber: e.target.value },
                stop.dropoff
              )
            }
            error={phoneError}
            sizeVariant="md"
          />
        </div>
        <StopOptionalPills
          codAmount={stop.codAmount}
          recipientName={stop.recipient.name}
          hasNote={Boolean(stop.recipient.notes?.trim())}
          hasImage={Boolean(resolvedImage)}
          showCod={isCodOpen}
          showName={isNameOpen}
          showNote={isNoteOpen}
          onToggleCod={handleToggleCod}
          onToggleName={handleToggleName}
          onToggleNote={handleToggleNote}
        />
      </div>

      {/* Row 3: Progressive Optional Fields Drawer */}
      <StopOptionalDrawer
        idPrefix={idPrefix}
        stop={stop}
        resolvedImage={resolvedImage}
        isCodOpen={isCodOpen}
        isNameOpen={isNameOpen}
        isNoteOpen={isNoteOpen}
        nameError={nameError}
        codError={codError}
        onUpdate={onUpdate}
      />
    </div>
  );
}
