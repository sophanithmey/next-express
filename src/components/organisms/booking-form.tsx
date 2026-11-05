'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  BookingFormData,
  BookingFeeQuote,
  BookingOrder,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { ExpressSearchBookingBar } from './express-search-booking-bar';
import { BookingConfirmation } from './booking-confirmation';
import { BookingSuccess } from './booking-success';
import { MapPin, Navigation, Clock, ShieldCheck, Zap } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

const DeliveryMap = dynamic(
  () => import('./delivery-map').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading route map…
      </div>
    ),
  }
);

interface BookingFormProps {
  initialLocations: PickupLocation[];
  initialDraft?: Partial<BookingFormData>;
}

const DEFAULT_PICKUP: PickupLocation = {
  name: 'Central Warehouse (Main)',
  address: 'St 271, Phum 4, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
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
    parcel: initialDraft?.parcel ?? { description: 'Apparel / Retail Parcel', sellerOrderRef: '', quantity: 1 },
    cod: initialDraft?.cod ?? { isCod: true, amount: 25 },
  });

  const [feeQuote, setFeeQuote] = useState<BookingFeeQuote | null>(null);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  // Recalculate fee quote whenever pickup or dropoff coordinates change
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
        // Fallback
      } finally {
        if (active) setIsLoadingFee(false);
      }
    };

    fetchFee();
    return () => {
      active = false;
    };
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

  const handleStartReview = () => {
    if (!validateBooking()) return;
    setIsReviewing(true);
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
      {/* Reference travel-style search booking bar */}
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
        onSearchSubmit={handleStartReview}
        onChangePickup={(pickup) => setFormData({ ...formData, pickup })}
        onChangeDropoff={(dropoff) => setFormData({ ...formData, dropoff })}
        onChangeRecipient={(recipient) => setFormData({ ...formData, recipient })}
        onChangeParcel={(parcel) => setFormData({ ...formData, parcel })}
        onChangeCod={(cod) => setFormData({ ...formData, cod })}
        onToggleBookingOnBehalf={(isBookingOnBehalf) =>
          setFormData({ ...formData, isBookingOnBehalf })
        }
        onChangeSenderName={(senderName) => setFormData({ ...formData, senderName })}
        onChangeSenderPhone={(senderPhone) => setFormData({ ...formData, senderPhone })}
      />

      {/* Live Route & Dispatch Preview Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Navigation className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Route &amp; Destination Map
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Courier Coverage: Phnom Penh
            </span>
          </div>

          <DeliveryMap
            pickupCoords={formData.pickup.coordinates}
            dropoffCoords={formData.dropoff.coordinates}
            onDropoffChange={(coords) =>
              setFormData((prev) => ({
                ...prev,
                dropoff: { ...prev.dropoff, coordinates: coords },
              }))
            }
            className="h-64 sm:h-72 w-full rounded-xl overflow-hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Pickup Point</span>
                <span className="font-semibold text-slate-800 block">{formData.pickup.name}</span>
                <span className="text-slate-500 text-[11px] line-clamp-1">{formData.pickup.address}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-start gap-2.5">
              <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Drop-off Destination</span>
                <span className="font-semibold text-slate-800 block truncate">
                  {formData.dropoff.address || 'Select destination in search bar'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Est. distance: ~{feeQuote?.distanceKm || 3.2} km
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Guarantee & Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Express Guarantee</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">15–30 Min Pickup</span>
                  <p className="text-slate-500 text-[11px]">
                    Couriers automatically assigned upon confirmation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Secure COD Remittance</span>
                  <p className="text-slate-500 text-[11px]">
                    Cash collected deposited directly to your merchant wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Estimated Delivery:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {APP_CONFIG.currencySymbol}{(feeQuote?.totalDeliveryFee ?? 1.6).toFixed(2)}
                </span>
              </div>
              {formData.cod.isCod && (
                <div className="flex justify-between items-center text-xs mt-1 text-emerald-700 font-semibold">
                  <span>Buyer COD:</span>
                  <span>{APP_CONFIG.currencySymbol}{formData.cod.amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartReview}
              className="w-full rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700 active:bg-brand-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Review &amp; Confirm Delivery</span>
              <Navigation className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
