'use client';

import React, { useState } from 'react';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { PickupSection } from './booking-sections/pickup-section';
import { DropoffSection } from './booking-sections/dropoff-section';
import { ParcelSection } from './booking-sections/parcel-section';
import { FormSection } from '../molecules/form-section';
import { CodToggle } from '../molecules/cod-toggle';
import { LocationPickerModal } from '../molecules/location-picker-modal';
import { Button } from '../atoms/button';
import { ArrowRight } from 'lucide-react';

interface BookingFormProps {
  formData: BookingFormData;
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onChangeCod: (cod: CodInfo) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errors: Record<string, string>;
}

export function BookingForm({
  formData,
  onChangePickup,
  onChangeDropoff,
  onChangeRecipient,
  onChangeParcel,
  onChangeCod,
  onSubmit,
  isSubmitting = false,
  errors,
}: BookingFormProps) {
  const [modalMode, setModalMode] = useState<'pickup' | 'dropoff' | null>(null);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Section A: Pickup Location */}
        <PickupSection
          pickup={formData.pickup}
          onChangePickup={onChangePickup}
          onOpenMap={() => setModalMode('pickup')}
          error={errors['pickup.address']}
        />

        {/* Section B: Drop-off Destination & Recipient */}
        <DropoffSection
          dropoff={formData.dropoff}
          recipient={formData.recipient}
          onChangeDropoff={onChangeDropoff}
          onChangeRecipient={onChangeRecipient}
          onOpenMap={() => setModalMode('dropoff')}
          errors={errors}
        />

        {/* Section C: Parcel Information */}
        <ParcelSection parcel={formData.parcel} onChangeParcel={onChangeParcel} />

        {/* Section D: Cash on Delivery (COD) */}
        <FormSection
          number="D"
          title="Cash on Delivery (COD)"
          subtitle="Collect money from buyer upon parcel delivery"
        >
          <CodToggle
            isCod={formData.cod.isCod}
            amount={formData.cod.amount}
            onToggle={(checked) =>
              onChangeCod({ isCod: checked, amount: checked ? (formData.cod.amount || 25) : 0 })
            }
            onChangeAmount={(amount) => onChangeCod({ ...formData.cod, amount })}
            error={errors['cod.amount']}
          />
        </FormSection>

        {/* Primary Action: Confirm Booking */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-5 w-5" />}
          >
            Confirm Booking
          </Button>
          <p className="text-center text-xs text-slate-400 mt-2.5">
            Instant courier dispatch upon confirmation • No upfront fees
          </p>
        </div>
      </form>

      {/* Map selection dialog */}
      <LocationPickerModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === 'pickup' ? 'Select Pickup Hub (Demo)' : 'Select Drop-off Zone (Demo)'}
        selectedAddress={
          modalMode === 'pickup' ? formData.pickup.address : formData.dropoff.address
        }
        onSelect={(loc) => {
          if (modalMode === 'pickup') {
            onChangePickup(loc);
          } else {
            onChangeDropoff({ address: loc.address, coordinates: loc.coordinates });
          }
        }}
      />
    </>
  );
}
