'use client';

import React, { useState, useEffect } from 'react';
import {
  BookingFormData,
  BookingFeeQuote,
  BookingOrder,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { ExpressSearchBookingBar } from './express-search-booking-bar';
import { RoutePreviewCard } from './express-search-bar/route-preview-card';
import { BookingConfirmation } from './booking-confirmation';
import { BookingSuccess } from './booking-success';

interface BookingFormProps {
  initialLocations: PickupLocation[];
  initialDraft?: Partial<BookingFormData>;
}

const DEFAULT_PICKUP: PickupLocation = {
  name: 'Central Warehouse (Main)',
  address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Mean Chey, Phnom Penh',
  coordinates: { lat: 11.5321, lng: 104.9123 },
};

const DEFAULT_DROPOFF = {
  address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
  coordinates: { lat: 11.5512, lng: 104.9256 },
};

export function BookingForm({ initialLocations, initialDraft }: BookingFormProps) {
  const defaultPickup =
    initialLocations.find((l) => l.isDefault) ?? initialLocations[0] ?? DEFAULT_PICKUP;

  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<BookingOrder | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    pickup: initialDraft?.pickup ?? defaultPickup,
    recipient: initialDraft?.recipient ?? { name: '', phoneNumber: '', notes: '' },
    isBookingOnBehalf: initialDraft?.isBookingOnBehalf ?? false,
    senderName: initialDraft?.senderName ?? '',
    senderPhone: initialDraft?.senderPhone ?? '',
    dropoff: initialDraft?.dropoff ?? DEFAULT_DROPOFF,
    parcel: initialDraft?.parcel ?? {
      description: 'Apparel / Retail Parcel',
      sellerOrderRef: '',
      quantity: 1,
    },
    cod: initialDraft?.cod ?? { isCod: true, amount: 25 },
  });

  const [feeQuote, setFeeQuote] = useState<BookingFeeQuote | null>(null);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchFee = async () => {
      setIsLoadingFee(true);
      try {
        const res = await fetch('/api/bookings/fee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickup: formData.pickup.coordinates,
            dropoff: formData.dropoff.coordinates,
          }),
        });
        if (res.ok && active) {
          const quote = await res.json();
          setFeeQuote(quote);
        }
      } catch {
        // Fallback calculation
      } finally {
        if (active) setIsLoadingFee(false);
      }
    };
    fetchFee();
    return () => { active = false; };
  }, [formData.pickup.coordinates, formData.dropoff.coordinates]);

  const validateBooking = (): boolean => {
    if (!formData.dropoff.address.trim()) {
      alert('Please enter a drop-off location address.');
      return false;
    }
    if (!formData.recipient.name.trim()) {
      alert('Please enter recipient customer name.');
      return false;
    }
    if (!formData.recipient.phoneNumber.trim() || formData.recipient.phoneNumber.length < 8) {
      alert('Please enter a valid recipient phone number (at least 8 digits).');
      return false;
    }
    if (formData.cod.isCod && (!formData.cod.amount || formData.cod.amount <= 0)) {
      alert('Please enter a valid COD collection amount greater than 0.');
      return false;
    }
    return true;
  };

  const handleCreateBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || 'Failed to submit booking. Please try again.');
        return;
      }
      setSubmittedOrder(data as BookingOrder);
      setIsReviewing(false);
    } catch {
      setSubmitError('Network error submitting booking. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setSubmittedOrder(null);
    setIsReviewing(false);
    setSubmitError(null);
    setFormData((prev) => ({
      ...prev,
      recipient: { name: '', phoneNumber: '', notes: '' },
      parcel: { description: 'Apparel / Retail Parcel', sellerOrderRef: '', quantity: 1 },
      cod: { isCod: true, amount: 25 },
    }));
  };

  if (submittedOrder) {
    return <BookingSuccess order={submittedOrder} onBookAnother={handleBookAnother} />;
  }

  if (isReviewing) {
    return (
      <BookingConfirmation
        formData={formData}
        feeQuote={feeQuote}
        onEditStep={() => setIsReviewing(false)}
        onConfirm={handleCreateBooking}
        onBack={() => setIsReviewing(false)}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ExpressSearchBookingBar
        pickup={formData.pickup}
        dropoff={formData.dropoff}
        recipient={formData.recipient}
        parcel={formData.parcel}
        cod={formData.cod}
        isBookingOnBehalf={formData.isBookingOnBehalf}
        senderName={formData.senderName}
        senderPhone={formData.senderPhone}
        savedLocations={initialLocations}
        feeQuote={feeQuote}
        isLoadingFee={isLoadingFee}
        isSubmitting={isSubmitting}
        onSearchSubmit={() => { if (validateBooking()) setIsReviewing(true); }}
        onChangePickup={(pickup) => setFormData({ ...formData, pickup })}
        onChangeDropoff={(dropoff) => setFormData({ ...formData, dropoff })}
        onChangeRecipient={(recipient) => setFormData({ ...formData, recipient })}
        onChangeParcel={(parcel) => setFormData({ ...formData, parcel })}
        onChangeCod={(cod) => setFormData({ ...formData, cod })}
        onToggleBookingOnBehalf={(isBookingOnBehalf) => setFormData({ ...formData, isBookingOnBehalf })}
        onChangeSenderName={(senderName) => setFormData({ ...formData, senderName })}
        onChangeSenderPhone={(senderPhone) => setFormData({ ...formData, senderPhone })}
      />

      <RoutePreviewCard
        formData={formData}
        feeQuote={feeQuote}
        onDropoffChange={(coords) => setFormData((prev) => ({ ...prev, dropoff: { ...prev.dropoff, coordinates: coords } }))}
        onReviewSubmit={() => { if (validateBooking()) setIsReviewing(true); }}
      />
    </div>
  );
}
