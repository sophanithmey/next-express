'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
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
import { ExpressSearchBookingBar } from '@/components/organisms/express-search-booking-bar';
import { RoutePreviewCard } from '@/components/organisms/express-search-bar/route-preview-card';
import { BookingActionBar } from '@/components/molecules/booking-action-bar';
import { AuthenticationModal } from '@/components/organisms/authentication-modal';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { UserProfile } from '@/features/auth/types/auth-types';
import { AlertCircle } from 'lucide-react';

interface BookingPageClientProps {
  initialLocations?: PickupLocation[];
}

export function BookingPageClient({ initialLocations = [] }: BookingPageClientProps) {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthState();

  const savedLocations = useMemo(() => {
    return initialLocations.length > 0 ? initialLocations : SAMPLE_PHNOM_PENH_LOCATIONS;
  }, [initialLocations]);

  const defaultPickup = savedLocations[0] || SAMPLE_PHNOM_PENH_LOCATIONS[0];

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
    senderName: '',
    senderPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic fee calculation based on coordinates
  const feeQuote = useMemo(() => {
    return calculateMockFee(formData.pickup.coordinates, formData.dropoff.coordinates);
  }, [formData.pickup.coordinates, formData.dropoff.coordinates]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup.address?.trim()) {
      newErrors['pickup.address'] = 'Pickup location address is required.';
    }
    if (!formData.dropoff.address?.trim()) {
      newErrors['dropoff.address'] = 'Drop-off location address is required.';
    }
    if (!formData.recipient.name?.trim()) {
      newErrors['recipient.name'] = 'Recipient full name is required.';
    }
    if (!formData.recipient.phoneNumber?.trim() || formData.recipient.phoneNumber.length < 8) {
      newErrors['recipient.phoneNumber'] = 'Valid phone number is required (at least 8 digits).';
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
    await new Promise((r) => setTimeout(r, 800));

    const ref = generateMockReference();
    const tracking = generateMockTracking();

    const query = new URLSearchParams({
      ref,
      tracking,
      pickup: formData.pickup.name || formData.pickup.address,
      dropoff: formData.dropoff.address,
      recipient: formData.recipient.name,
      cod: formData.cod.isCod ? String(formData.cod.amount) : '0',
    });

    // Background sync with API for history tracking
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).catch(() => {});

    setIsSubmitting(false);
    router.push(`/booking/success?${query.toString()}`);
  };

  const handleConfirmClick = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      handleBookingSubmission();
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    login(user);
    setIsAuthModalOpen(false);
    // Continue pending booking seamlessly
    handleBookingSubmission();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Validation Banner (if any errors exist) */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{Object.values(errors)[0]}</span>
        </div>
      )}

      {/* Refined Horizontal Travel-Style Booking Bar */}
      <ExpressSearchBookingBar
        pickup={formData.pickup}
        dropoff={formData.dropoff}
        recipient={formData.recipient}
        parcel={formData.parcel}
        cod={formData.cod}
        isBookingOnBehalf={formData.isBookingOnBehalf ?? false}
        senderName={formData.senderName}
        senderPhone={formData.senderPhone}
        savedLocations={savedLocations}
        feeQuote={feeQuote}
        isLoadingFee={false}
        isSubmitting={isSubmitting}
        onSearchSubmit={handleConfirmClick}
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
          setErrors((prev) => ({ ...prev, 'recipient.name': '', 'recipient.phoneNumber': '' }));
        }}
        onChangeParcel={(parcel) => setFormData((prev) => ({ ...prev, parcel }))}
        onChangeCod={(cod) => {
          setFormData((prev) => ({ ...prev, cod }));
          setErrors((prev) => ({ ...prev, 'cod.amount': '' }));
        }}
        onToggleBookingOnBehalf={(checked) =>
          setFormData((prev) => ({ ...prev, isBookingOnBehalf: checked }))
        }
        onChangeSenderName={(senderName) => setFormData((prev) => ({ ...prev, senderName }))}
        onChangeSenderPhone={(senderPhone) => setFormData((prev) => ({ ...prev, senderPhone }))}
      />

      {/* Live Route Map & Dispatch Overview */}
      <RoutePreviewCard
        formData={formData}
        feeQuote={feeQuote}
        onDropoffChange={(coords) =>
          setFormData((prev) => ({
            ...prev,
            dropoff: { ...prev.dropoff, coordinates: coords },
          }))
        }
        onReviewSubmit={handleConfirmClick}
      />

      {/* Sticky Floating Action Bar (Pixel-matching Image 1) */}
      <BookingActionBar
        onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSubmit={handleConfirmClick}
        isSubmitting={isSubmitting}
        canProceed={true}
        estimatedFee={feeQuote?.totalDeliveryFee}
        showBack={true}
        submitLabel="Confirm & Book Delivery"
      />

      {/* Guest Authentication Modal */}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
