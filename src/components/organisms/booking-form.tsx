'use client';

import React, { useState, useEffect } from 'react';
import { BookingFormData, BookingFeeQuote, BookingOrder, PickupLocation } from '@/features/booking/types/booking-types';
import { useMockBooking } from '@/features/booking/hooks/use-mock-booking';
import { LocationPicker } from './location-picker';
import { RecipientForm } from './recipient-form';
import { DropoffPicker } from './dropoff-picker';
import { ParcelInformation } from './parcel-information';
import { CodSection } from './cod-section';
import { BookingSummary } from './booking-summary';
import { BookingActionBar } from '../molecules/booking-action-bar';
import { BookingConfirmation } from './booking-confirmation';
import { BookingSuccess } from './booking-success';
import { MapPin, User, Navigation, Package, Banknote } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BookingFormProps {
  initialLocations: PickupLocation[];
  initialDraft?: Partial<BookingFormData>;
}

const DEFAULT_PICKUP: PickupLocation = {
  name: 'Main Warehouse',
  address: 'Phnom Penh, Cambodia',
  coordinates: { lat: 11.5564, lng: 104.9282 },
};

const DEFAULT_DROPOFF = {
  address: 'Central Phnom Penh',
  coordinates: { lat: 11.565, lng: 104.92 },
};

const STEPS = [
  { num: 1, label: 'Pickup', icon: MapPin },
  { num: 2, label: 'Recipient', icon: User },
  { num: 3, label: 'Drop-off', icon: Navigation },
  { num: 4, label: 'Parcel', icon: Package },
  { num: 5, label: 'COD', icon: Banknote },
];

export function BookingForm({ initialLocations, initialDraft }: BookingFormProps) {
  const defaultPickup =
    initialLocations.find((l) => l.isDefault) ?? initialLocations[0] ?? DEFAULT_PICKUP;

  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<BookingOrder | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    pickup: initialDraft?.pickup ?? defaultPickup,
    recipient: initialDraft?.recipient ?? { name: '', phoneNumber: '', notes: '' },
    isBookingOnBehalf: initialDraft?.isBookingOnBehalf ?? false,
    senderName: initialDraft?.senderName ?? '',
    senderPhone: initialDraft?.senderPhone ?? '',
    dropoff: initialDraft?.dropoff ?? DEFAULT_DROPOFF,
    parcel: initialDraft?.parcel ?? { description: '', sellerOrderRef: '', quantity: 1 },
    cod: initialDraft?.cod ?? { isCod: false, amount: 0 },
  });

  const [feeQuote, setFeeQuote] = useState<BookingFeeQuote | null>(null);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const { submitMockBooking, isSubmitting } = useMockBooking();

  // Recalculate fee whenever pickup/dropoff changes
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
        // Silently ignore — fee is best-effort
      } finally {
        if (active) setIsLoadingFee(false);
      }
    };
    fetchFee();
    return () => { active = false; };
  }, [formData.pickup.coordinates, formData.dropoff.coordinates]);

  const handleCreateBooking = async () => {
    const order = await submitMockBooking(formData);
    setSubmittedOrder(order);
    setIsReviewing(false);
  };

  const handleBookAnother = () => {
    setSubmittedOrder(null);
    setIsReviewing(false);
    setCurrentStep(2); // Skip pickup — keep same warehouse
    setFormData((prev) => ({
      ...prev,
      recipient: { name: '', phoneNumber: '', notes: '' },
      parcel: { description: '', sellerOrderRef: '', quantity: 1 },
      cod: { isCod: false, amount: 0 },
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
        onEditStep={(step) => { setCurrentStep(step); setIsReviewing(false); }}
        onConfirm={handleCreateBooking}
        onBack={() => setIsReviewing(false)}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Navigator */}
      <div className="flex items-center justify-between overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all select-none',
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : isDone
                  ? 'text-brand-700 hover:bg-slate-50'
                  : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <LocationPicker
              savedLocations={initialLocations}
              selectedLocation={formData.pickup}
              onSelectLocation={(loc) => setFormData({ ...formData, pickup: loc })}
            />
          )}
          {currentStep === 2 && (
            <RecipientForm
              recipient={formData.recipient}
              onChangeRecipient={(rec) => setFormData({ ...formData, recipient: rec })}
              isBookingOnBehalf={formData.isBookingOnBehalf}
              onToggleBookingOnBehalf={(val) => setFormData({ ...formData, isBookingOnBehalf: val })}
              senderName={formData.senderName}
              onChangeSenderName={(val) => setFormData({ ...formData, senderName: val })}
              senderPhone={formData.senderPhone}
              onChangeSenderPhone={(val) => setFormData({ ...formData, senderPhone: val })}
              onAutofillAddress={(addr, coords) =>
                setFormData((prev) => ({
                  ...prev,
                  dropoff: { ...prev.dropoff, address: addr, coordinates: coords },
                }))
              }
            />
          )}
          {currentStep === 3 && (
            <DropoffPicker
              pickupLocation={formData.pickup}
              dropoffLocation={formData.dropoff}
              onChangeDropoff={(dropoff) => setFormData({ ...formData, dropoff })}
            />
          )}
          {currentStep === 4 && (
            <ParcelInformation
              parcel={formData.parcel}
              onChangeParcel={(parcel) => setFormData({ ...formData, parcel })}
            />
          )}
          {currentStep === 5 && (
            <CodSection
              cod={formData.cod}
              onChangeCod={(cod) => setFormData({ ...formData, cod })}
            />
          )}

          <BookingActionBar
            currentStep={currentStep}
            totalSteps={5}
            onBack={() => setCurrentStep((s) => Math.max(1, s - 1))}
            onNext={() => {
              if (currentStep === 5) {
                setIsReviewing(true);
              } else {
                setCurrentStep((s) => s + 1);
              }
            }}
            estimatedFee={feeQuote?.totalDeliveryFee}
          />
        </div>

        <div className="lg:col-span-1">
          <BookingSummary
            pickup={formData.pickup}
            dropoff={formData.dropoff}
            feeQuote={feeQuote}
            cod={formData.cod}
            isLoadingFee={isLoadingFee}
          />
        </div>
      </div>
    </div>
  );
}
