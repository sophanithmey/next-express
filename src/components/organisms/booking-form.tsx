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
import { SavedLocationItem } from '../molecules/location-picker-saved-list';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { StickyBookingActionBar } from '../molecules/sticky-booking-action-bar';
import { BookingLayoutMode } from '../molecules/booking-layout-switcher';
import { BookingFormMapModal } from '../molecules/booking-form-map-modal';
import { getSpeedOptionFees } from '@/features/booking/services/pricing-service';

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
              isCod={
                Boolean(formData.dropoffs?.some((stop) => (stop.codAmount ?? 0) > 0)) ||
                formData.cod.isCod
              }
              error={errors['pickup.address']}
              phoneError={errors['pickup.senderPhone']}
              bankNameError={errors['pickup.settlementAccountName']}
              bankNumberError={errors['pickup.settlementAccountNumber']}
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
      <BookingFormMapModal
        modalMode={modalMode}
        activeStopIndex={activeStopIndex}
        onClose={() => setModalMode(null)}
        formData={formData}
        savedLocations={savedLocations}
        onCreateLocation={onCreateLocation}
        onChangePickup={onChangePickup}
        onChangeDropoff={onChangeDropoff}
        onChangeDropoffs={onChangeDropoffs}
      />
    </>
  );
}
