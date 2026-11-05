'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  ParcelInfo,
  CodInfo,
} from '../types/booking-types';
import {
  SAMPLE_PHNOM_PENH_LOCATIONS,
  calculateMockFee,
  generateMockReference,
  generateMockTracking,
} from '../data/mock-booking-data';
import { BookingForm } from '@/components/organisms/booking-form';
import { BookingSummary } from '@/components/organisms/booking-summary';
import { AuthenticationModal } from '@/components/organisms/authentication-modal';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { UserProfile } from '@/features/auth/types/auth-types';

interface BookingPageClientProps {
  initialLocations?: PickupLocation[];
}

export function BookingPageClient({ initialLocations = [] }: BookingPageClientProps) {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthState();

  const defaultPickup =
    initialLocations[0] || SAMPLE_PHNOM_PENH_LOCATIONS[0];

  const [formData, setFormData] = useState<BookingFormData>({
    pickup: defaultPickup,
    dropoff: {
      address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
    },
    recipient: {
      name: 'Sokha Chan',
      phoneNumber: '012 998 877',
      notes: '',
    },
    dropoffs: [
      {
        id: 'stop-1',
        recipient: {
          name: 'Sokha Chan',
          phoneNumber: '012 998 877',
          notes: '',
        },
        dropoff: {
          address: 'BKK1, Khan Boeng Keng Kang, Phnom Penh',
          coordinates: { lat: 11.5512, lng: 104.9256 },
        },
      },
    ],
    parcel: {
      description: 'Apparel / Retail Parcel',
      sellerOrderRef: 'LIVE-0914',
      quantity: 1,
    },
    cod: {
      isCod: true,
      amount: 25,
    },
    isBookingOnBehalf: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live estimated delivery fee (accounting for extra stops)
  const feeQuote = useMemo(() => {
    const additionalStops = Math.max(0, (formData.dropoffs?.length || 1) - 1);
    return calculateMockFee(
      formData.pickup.coordinates,
      formData.dropoff.coordinates,
      additionalStops
    );
  }, [formData.pickup.coordinates, formData.dropoff.coordinates, formData.dropoffs]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup.address?.trim()) {
      newErrors['pickup.address'] = 'Pickup address is required.';
    }

    if (formData.dropoffs && formData.dropoffs.length > 0) {
      formData.dropoffs.forEach((stop, idx) => {
        // Recipient name is optional
        if (!stop.recipient.phoneNumber?.trim() || stop.recipient.phoneNumber.length < 8) {
          newErrors[`dropoffs.${idx}.phoneNumber`] = `Valid phone for Destination ${idx + 1} is required (at least 8 digits).`;
        }
        if (!stop.dropoff.address?.trim()) {
          newErrors[`dropoffs.${idx}.address`] = `Drop-off address for Destination ${idx + 1} is required.`;
        }
      });
    } else {
      if (!formData.dropoff.address?.trim()) {
        newErrors['dropoff.address'] = 'Drop-off address is required.';
      }
      if (!formData.recipient.phoneNumber?.trim() || formData.recipient.phoneNumber.length < 8) {
        newErrors['recipient.phoneNumber'] = 'Valid phone number is required (at least 8 digits).';
      }
    }

    if (formData.cod.isCod && (!formData.cod.amount || formData.cod.amount <= 0)) {
      newErrors['cod.amount'] = 'Please enter a COD amount greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmission = async () => {
    setIsSubmitting(true);

    // Simulate mock booking submission
    await new Promise((r) => setTimeout(r, 900));

    const ref = generateMockReference();
    const tracking = generateMockTracking();
    const stopsCount = formData.dropoffs?.length || 1;
    const dropoffSummary =
      stopsCount > 1
        ? `${formData.dropoff.address} (+${stopsCount - 1} more stop${stopsCount > 2 ? 's' : ''})`
        : formData.dropoff.address;

    const query = new URLSearchParams({
      ref,
      tracking,
      pickup: formData.pickup.name || formData.pickup.address,
      dropoff: dropoffSummary,
      recipient: formData.recipient.name,
      stops: String(stopsCount),
      cod: formData.cod.isCod ? String(formData.cod.amount) : '0',
    });

    // Also attempt background sync with API for history
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).catch(() => {});

    setIsSubmitting(false);
    router.push(`/booking/success?${query.toString()}`);
  };

  const handleConfirmClick = () => {
    if (!validate()) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      handleBookingSubmission();
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    login(user);
    setIsAuthModalOpen(false);
    // Automatically continue pending booking
    handleBookingSubmission();
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left: Booking Form (approximately 65%) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <BookingForm
            formData={formData}
            onChangePickup={(pickup) => {
              setFormData((prev) => ({ ...prev, pickup }));
              setErrors((prev) => ({ ...prev, 'pickup.address': '' }));
            }}
            onChangeDropoff={(dropoff) => {
              setFormData((prev) => ({ ...prev, dropoff }));
              setErrors((prev) => ({ ...prev, 'dropoff.address': '' }));
            }}
            onChangeRecipient={(recipient) => {
              setFormData((prev) => ({ ...prev, recipient }));
              setErrors((prev) => ({
                ...prev,
                'recipient.name': '',
                'recipient.phoneNumber': '',
              }));
            }}
            onChangeDropoffs={(dropoffs) => {
              setFormData((prev) => ({
                ...prev,
                dropoffs,
                recipient: dropoffs[0]?.recipient || prev.recipient,
                dropoff: dropoffs[0]?.dropoff || prev.dropoff,
              }));
            }}
            onChangeParcel={(parcel) => setFormData((prev) => ({ ...prev, parcel }))}
            onChangeCod={(cod) => {
              setFormData((prev) => ({ ...prev, cod }));
              setErrors((prev) => ({ ...prev, 'cod.amount': '' }));
            }}
            onSubmit={handleConfirmClick}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        </div>

        {/* Right: Delivery Summary (approximately 35%) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <BookingSummary
            pickup={formData.pickup}
            dropoff={formData.dropoff}
            dropoffs={formData.dropoffs}
            recipient={formData.recipient}
            parcel={formData.parcel}
            cod={formData.cod}
            feeQuote={feeQuote}
          />
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
