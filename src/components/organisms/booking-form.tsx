'use client';

import React, { useState } from 'react';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { PickupSection } from './booking-sections/pickup-section';
import { DropoffSection } from './booking-sections/dropoff-section';
import { ParcelCodSection } from './booking-sections/parcel-cod-section';
import { LocationPickerModal } from '../molecules/location-picker-modal';
import { StickyBookingActionBar } from '../molecules/sticky-booking-action-bar';

interface BookingFormProps {
  formData: BookingFormData;
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onChangeCod: (cod: CodInfo) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errors: Record<string, string>;
  fee?: number;
}

export function BookingForm({
  formData,
  onChangePickup,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
  onChangeParcel,
  onChangeCod,
  onSubmit,
  isSubmitting = false,
  errors,
  fee = 1.75,
}: BookingFormProps) {
  const [modalMode, setModalMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className='space-y-5'
      >
        {/* Section A: Pickup Location */}
        <PickupSection
          pickup={formData.pickup}
          onChangePickup={onChangePickup}
          onOpenMap={() => setModalMode('pickup')}
          error={errors['pickup.address']}
        />

        {/* Section B: Drop-off Destinations & Recipients (Multi-Drop) */}
        <DropoffSection
          dropoff={formData.dropoff}
          recipient={formData.recipient}
          dropoffs={formData.dropoffs}
          onChangeDropoff={onChangeDropoff}
          onChangeRecipient={onChangeRecipient}
          onChangeDropoffs={onChangeDropoffs}
          onOpenMap={(index = 0) => {
            setActiveStopIndex(index);
            setModalMode('dropoff');
          }}
          errors={errors}
        />

        {/* Section C: Optional Parcel & Cash on Delivery (COD) Options */}
        <ParcelCodSection
          parcel={formData.parcel}
          cod={formData.cod}
          onChangeParcel={onChangeParcel}
          onChangeCod={onChangeCod}
          error={errors['cod.amount']}
        />

        {/* Sticky Primary Action: Review & Payment */}
        <StickyBookingActionBar
          fee={fee}
          stopsCount={formData.dropoffs?.length || 1}
          codAmount={formData.cod.amount}
          isCod={formData.cod.isCod}
          isSubmitting={isSubmitting}
          onClick={onSubmit}
        />
      </form>

      {/* Map selection dialog */}
      <LocationPickerModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={
          modalMode === 'pickup'
            ? 'Select Pickup Hub (Demo)'
            : `Select Drop-off Destination ${activeStopIndex + 1} (Demo)`
        }
        selectedAddress={
          modalMode === 'pickup'
            ? formData.pickup.address
            : formData.dropoffs?.[activeStopIndex]?.dropoff.address ||
              formData.dropoff.address
        }
        onSelect={(loc) => {
          if (modalMode === 'pickup') {
            onChangePickup(loc);
          } else {
            if (formData.dropoffs && formData.dropoffs.length > 0) {
              const nextStops = formData.dropoffs.map((s, idx) =>
                idx === activeStopIndex
                  ? {
                      ...s,
                      dropoff: {
                        address: loc.address,
                        coordinates: loc.coordinates,
                      },
                    }
                  : s
              );
              onChangeDropoffs?.(nextStops);
              if (activeStopIndex === 0) {
                onChangeDropoff({
                  address: loc.address,
                  coordinates: loc.coordinates,
                });
              }
            } else {
              onChangeDropoff({
                address: loc.address,
                coordinates: loc.coordinates,
              });
            }
          }
        }}
      />
    </>
  );
}
