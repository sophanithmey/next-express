'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { usePickupSection } from '@/features/booking/hooks/use-pickup-section';
import { FormSection } from '../../molecules/form-section';
import { PickupFields } from '../../molecules/pickup-fields';
import { PickupCompactCard } from './pickup-compact-card';
import { Map, Check, MapPinHouse } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PickupSectionProps {
  pickup: PickupLocation;
  onChangePickup: (loc: PickupLocation) => void;
  onOpenMap: () => void;
  isCod?: boolean;
  error?: string;
  phoneError?: string;
  bankNameError?: string;
  bankNumberError?: string;
  savedLocations?: (PickupLocation & { tag?: string })[];
}

export function PickupSection({
  pickup,
  onChangePickup,
  onOpenMap,
  isCod = false,
  error,
  phoneError,
  bankNameError,
  bankNumberError,
  savedLocations,
}: PickupSectionProps) {
  const tPickup = useTranslations('Pickup');
  const tCommon = useTranslations('Common');
  const {
    isEditMode,
    openBankOnEdit,
    isLocating,
    handleGetCurrentLocation,
    handleDoneEditing,
    handleStartEditing,
    handleOpenBankEdit,
  } = usePickupSection({
    pickup,
    onChangePickup,
    hasValidationError: Boolean(
      error || phoneError || bankNameError || bankNumberError,
    ),
  });

  return (
    <FormSection
      icon={<MapPinHouse className='h-4 w-4' />}
      iconClassName='bg-secondary-50 text-secondary-700 border border-secondary-200'
      title={tPickup('title')}
      titleClassName='text-secondary-950 font-bold'
      subtitle={tPickup('subtitle')}
      action={
        isEditMode ? (
          <button
            type='button'
            onClick={handleDoneEditing}
            className='flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs'
          >
            <Check className='h-3 w-3 text-success-600' />
            <span>{tCommon('done')}</span>
          </button>
        ) : (
          <button
            type='button'
            onClick={onOpenMap}
            className='flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 transition cursor-pointer'
          >
            <Map className='h-3.5 w-3.5' />
            <span>
              {tCommon('map')} / {tCommon('hubs')}
            </span>
          </button>
        )
      }
    >
      {!isEditMode ? (
        <PickupCompactCard
          pickup={pickup}
          isCodRequired={isCod}
          onChangeClick={handleStartEditing}
          onOpenBankClick={handleOpenBankEdit}
        />
      ) : (
        <div className='animate-in fade-in duration-150'>
          <PickupFields
            idPrefix='pickup'
            pickup={pickup}
            onChange={onChangePickup}
            onOpenMap={onOpenMap}
            onUseCurrentLocation={handleGetCurrentLocation}
            isLocating={isLocating}
            isCod={isCod}
            defaultBankOpen={openBankOnEdit}
            savedLocations={savedLocations}
            addressError={error}
            phoneError={phoneError}
            bankNameError={bankNameError}
            bankNumberError={bankNumberError}
          />
        </div>
      )}
    </FormSection>
  );
}
