'use client';

import React, { useState } from 'react';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  ParcelInfo,
  DeliverySpeedOption,
  DeliverySchedule,
} from '@/features/booking/types/booking-types';
import { PickupSection } from './booking-sections/pickup-section';
import { DropoffSection } from './booking-sections/dropoff-section';
import { DeliveryOptionsSection } from './booking-sections/delivery-options-section';
import { ParcelCodSection } from './booking-sections/parcel-cod-section';
import { BookingHorizontalForm } from './booking-horizontal-form';
import { LocationPickerModal } from '../molecules/location-picker-modal';
import { SavedLocationItem } from '../molecules/location-picker-saved-list';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { StickyBookingActionBar } from '../molecules/sticky-booking-action-bar';
import { BookingLayoutMode } from '../molecules/booking-layout-switcher';
import { getSpeedOptionFees } from '@/features/booking/services/pricing-service';
import { useTranslations } from 'next-intl';

interface BookingFormProps {
  formData: BookingFormData;
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
  onChangeDeliveryOption?: (option: DeliverySpeedOption) => void;
  onChangeDeliverySchedule?: (schedule: DeliverySchedule) => void;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onOptimizeRoute?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errors: Record<string, string>;
  fee?: number;
  savedLocations?: (PickupLocation & { tag?: string })[];
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
  layoutMode?: BookingLayoutMode;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

export function BookingForm({
  formData,
  onChangePickup,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
  onChangeDeliveryOption,
  onChangeDeliverySchedule,
  onChangeParcel,
  onOptimizeRoute,
  onSubmit,
  isSubmitting = false,
  errors,
  fee = 1.75,
  savedLocations,
  onCreateLocation,
  layoutMode = 'vertical',
  onSaveDraft,
  isSavingDraft = false,
}: BookingFormProps) {
  const tPickup = useTranslations('Pickup');
  const tRecipient = useTranslations('Recipient');
  const [modalMode, setModalMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const { instantFee, sameDayFee, scheduledFee } = getSpeedOptionFees(
    fee,
    formData.deliveryOption || 'instant',
  );

  const handleOpenMap = (mode: 'pickup' | 'dropoff', index = 0) => {
    setActiveStopIndex(index);
    setModalMode(mode);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className='space-y-6'
      >
        {layoutMode === 'horizontal' ? (
          <BookingHorizontalForm
            formData={formData}
            onChangePickup={onChangePickup}
            onChangeDropoff={onChangeDropoff}
            onChangeRecipient={onChangeRecipient}
            onChangeDropoffs={onChangeDropoffs}
            onChangeDeliveryOption={onChangeDeliveryOption}
            onChangeDeliverySchedule={onChangeDeliverySchedule}
            onChangeParcel={onChangeParcel}
            onOptimizeRoute={onOptimizeRoute}
            onOpenMap={handleOpenMap}
            errors={errors}
            fee={fee}
            savedLocations={savedLocations}
          />
        ) : (
          <div className='space-y-5'>
            <PickupSection
              pickup={formData.pickup}
              onChangePickup={onChangePickup}
              onOpenMap={() => handleOpenMap('pickup')}
              error={errors['pickup.address']}
              phoneError={errors['pickup.senderPhone']}
              savedLocations={savedLocations}
            />

            <DropoffSection
              dropoff={formData.dropoff}
              recipient={formData.recipient}
              dropoffs={formData.dropoffs}
              cod={formData.cod}
              onChangeDropoff={onChangeDropoff}
              onChangeRecipient={onChangeRecipient}
              onChangeDropoffs={onChangeDropoffs}
              onOptimizeRoute={onOptimizeRoute}
              onOpenMap={(index = 0) => handleOpenMap('dropoff', index)}
              errors={errors}
            />

            <DeliveryOptionsSection
              selectedOption={formData.deliveryOption || 'instant'}
              onChangeOption={(option) => onChangeDeliveryOption?.(option)}
              schedule={formData.deliverySchedule}
              onChangeSchedule={onChangeDeliverySchedule}
              instantFee={instantFee}
              sameDayFee={sameDayFee}
              scheduledFee={scheduledFee}
            />

            <ParcelCodSection
              parcel={formData.parcel}
              onChangeParcel={onChangeParcel}
            />
          </div>
        )}

        {/* Sticky Primary Action: Review & Payment & Save Draft */}
        <StickyBookingActionBar
          fee={fee}
          stopsCount={formData.dropoffs?.length || 1}
          codAmount={formData.cod.amount}
          isCod={formData.cod.isCod}
          isSubmitting={isSubmitting}
          onClick={onSubmit}
          onSaveDraft={onSaveDraft}
          isSavingDraft={isSavingDraft}
        />
      </form>

      {/* Map selection dialog */}
      <LocationPickerModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={
          modalMode === 'pickup'
            ? tPickup('selectLocation')
            : tRecipient('destinationIndex', { index: activeStopIndex + 1 })
        }
        selectedAddress={
          modalMode === 'pickup'
            ? formData.pickup.address
            : formData.dropoffs?.[activeStopIndex]?.dropoff.address ||
              formData.dropoff.address
        }
        initialCoords={
          modalMode === 'pickup'
            ? formData.pickup.coordinates
            : formData.dropoffs?.[activeStopIndex]?.dropoff.coordinates ||
              formData.dropoff.coordinates
        }
        savedLocations={savedLocations}
        defaultContact={modalMode === 'pickup' ? formData.pickup.senderPhone || '' : ''}
        onCreateLocation={onCreateLocation}
        onSelect={(loc) => {
          if (modalMode === 'pickup') {
            onChangePickup({
              ...formData.pickup,
              id: loc.id ?? formData.pickup.id,
              name: loc.name,
              address: loc.address,
              coordinates: loc.coordinates,
              riderNote: loc.riderNote ?? formData.pickup.riderNote,
              imageUrl: loc.imageUrl ?? formData.pickup.imageUrl,
              senderName: loc.senderName || formData.pickup.senderName,
              senderPhone: loc.senderPhone || formData.pickup.senderPhone,
            });
            return;
          }
          const nextDropoff = {
            address: loc.address,
            coordinates: loc.coordinates,
          };
          if (formData.dropoffs && formData.dropoffs.length > 0) {
            onChangeDropoffs?.(
              formData.dropoffs.map((s, idx) =>
                idx === activeStopIndex ? { ...s, dropoff: nextDropoff } : s,
              ),
            );
          }
          if (!formData.dropoffs?.length || activeStopIndex === 0) {
            onChangeDropoff(nextDropoff);
          }
        }}
      />
    </>
  );
}
