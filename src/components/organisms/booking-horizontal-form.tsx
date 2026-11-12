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
import { BookingHorizontalRoutePreview } from './booking-horizontal-route-preview';
import { DeliveryOptionsSection } from './booking-sections/delivery-options-section';
import { BookingHorizontalParcelCard } from './booking-horizontal-parcel-card';
import { PickupDetailsModal } from './pickup-details-modal';
import { RecipientDestinationModal } from './recipient-destination-modal';
import { getSpeedOptionFees } from '@/features/booking/services/pricing-service';
import { seedPerStopCodOnExpand } from '@/features/booking/services/booking-form-helpers';

interface BookingHorizontalFormProps {
  formData: BookingFormData;
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
  onChangeDeliveryOption?: (option: DeliverySpeedOption) => void;
  onChangeDeliverySchedule?: (schedule: DeliverySchedule) => void;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onOptimizeRoute?: () => void;
  onOpenMap: (mode: 'pickup' | 'dropoff', index?: number) => void;
  errors: Record<string, string>;
  fee?: number;
  savedLocations?: (PickupLocation & { tag?: string })[];
}

export function BookingHorizontalForm({
  formData,
  onChangePickup,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
  onChangeDeliveryOption,
  onChangeDeliverySchedule,
  onChangeParcel,
  onOptimizeRoute,
  onOpenMap,
  errors,
  fee = 1.75,
  savedLocations,
}: BookingHorizontalFormProps) {
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDropoffModalOpen, setIsDropoffModalOpen] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const { instantFee, sameDayFee, scheduledFee } = getSpeedOptionFees(
    fee,
    formData.deliveryOption || 'instant'
  );

  const currentStops =
    formData.dropoffs && formData.dropoffs.length > 0
      ? formData.dropoffs
      : [{ id: 'stop-1', recipient: formData.recipient, dropoff: formData.dropoff }];

  const handleOpenDropoffModal = (index = 0) => {
    setActiveStopIndex(index);
    setIsDropoffModalOpen(true);
  };

  const handleSaveDestination = (
    rec: RecipientInfo,
    drop: DropoffLocation,
    stops?: DropoffStop[]
  ) => {
    onChangeRecipient(rec);
    onChangeDropoff(drop);
    if (stops && stops.length > 0) {
      onChangeDropoffs?.(stops);
    }
  };

  const handleReorderDropoffs = (stops: DropoffStop[]) => {
    onChangeDropoffs?.(stops);
  };

  const handleRemoveDropoff = (index: number) => {
    const nextStops = currentStops.filter((_, idx) => idx !== index);
    if (nextStops.length > 0) {
      onChangeDropoffs?.(nextStops);
    }
  };

  const handleAddDropoff = () => {
    const seededStops = seedPerStopCodOnExpand(currentStops, formData.cod);
    const nextIdx = seededStops.length + 1;
    const newStop: DropoffStop = {
      id: `stop-${Date.now()}`,
      recipient: { name: '', phoneNumber: '', notes: '' },
      dropoff: {
        address: '',
        coordinates: { lat: 11.5512 + nextIdx * 0.005, lng: 104.9256 + nextIdx * 0.005 },
      },
      codAmount: 0,
    };
    const nextStops = [...seededStops, newStop];
    onChangeDropoffs?.(nextStops);
    setActiveStopIndex(nextStops.length - 1);
    setIsDropoffModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Main Route Preview Card */}
      <BookingHorizontalRoutePreview
        pickup={formData.pickup}
        dropoff={formData.dropoff}
        dropoffs={formData.dropoffs}
        recipient={formData.recipient}
        fee={fee}
        cod={formData.cod}
        onOpenPickupModal={() => setIsPickupModalOpen(true)}
        onOpenDropoffModal={handleOpenDropoffModal}
        onReorderDropoffs={handleReorderDropoffs}
        onRemoveDropoff={handleRemoveDropoff}
        onAddDropoff={handleAddDropoff}
        onOptimizeRoute={onOptimizeRoute}
      />

      {/* 2. Delivery Speed Options */}
      <DeliveryOptionsSection
        selectedOption={formData.deliveryOption || 'instant'}
        onChangeOption={(opt) => onChangeDeliveryOption?.(opt)}
        schedule={formData.deliverySchedule}
        onChangeSchedule={onChangeDeliverySchedule}
        instantFee={instantFee}
        sameDayFee={sameDayFee}
        scheduledFee={scheduledFee}
      />

      {/* 3. Expandable Parcel Details Card */}
      <BookingHorizontalParcelCard
        parcel={formData.parcel}
        onChangeParcel={onChangeParcel}
      />

      {/* Point A: Pickup Details Modal */}
      <PickupDetailsModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        pickup={formData.pickup}
        onSavePickup={onChangePickup}
        onOpenMap={() => onOpenMap('pickup')}
        isCod={
          currentStops.some((stop) => (stop.codAmount ?? 0) > 0) ||
          formData.cod.isCod
        }
        savedLocations={savedLocations}
        error={errors['pickup.address']}
        phoneError={errors['pickup.senderPhone']}
        bankNameError={errors['pickup.settlementAccountName']}
        bankNumberError={errors['pickup.settlementAccountNumber']}
      />

      {/* Point B: Recipient & Destination Modal */}
      <RecipientDestinationModal
        isOpen={isDropoffModalOpen}
        onClose={() => setIsDropoffModalOpen(false)}
        recipient={formData.recipient}
        dropoff={formData.dropoff}
        dropoffs={formData.dropoffs}
        orderCod={formData.cod}
        onSaveDestination={handleSaveDestination}
        onOpenMap={(index) => onOpenMap('dropoff', index)}
        errors={errors}
        initialStopIndex={activeStopIndex}
      />
    </div>
  );
}
