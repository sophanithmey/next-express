'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  BookingFormData,
  PickupLocation,
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
  ParcelInfo,
  DeliverySpeedOption,
  DeliverySchedule,
  BookingOrder,
} from '../types/booking-types';
import {
  SAMPLE_PHNOM_PENH_LOCATIONS,
  calculateMockFee,
} from '../data/mock-booking-data';
import { MOCK_BOOKING_DETAILS } from '../data/mock-booking-detail-data';
import {
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
} from '../services/booking-draft-service';
import {
  createDefaultBookingForm,
  validateBookingFormData,
  createPrefillFromOrder,
  normalizeBookingPhones,
  syncCodWithDropoffs,
} from '../services/booking-form-helpers';
import { optimizeStopOrder } from '../services/route-optimizer';

export function useBookingPageForm(
  initialLocations: (PickupLocation & {
    tag?: string;
  })[] = SAMPLE_PHNOM_PENH_LOCATIONS,
) {
  const router = useRouter();
  const tBooking = useTranslations('Booking');

  const [formData, setFormData] = useState<BookingFormData>(() =>
    createDefaultBookingForm(initialLocations[0]),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isHydratedRef = useRef(false);

  // Restore draft if returning from Review page or previous session, preserving deliveryOption
  useEffect(() => {
    const draft = loadBookingDraft();
    if (draft && draft.pickup?.address) {
      const restoredStops = draft.dropoffs?.length ? draft.dropoffs : undefined;
      const updatedDraft: BookingFormData = {
        ...draft,
        deliveryOption: draft.deliveryOption || 'instant',
        cod: restoredStops
          ? syncCodWithDropoffs(restoredStops, draft.cod)
          : draft.cod,
      };
      setFormData(updatedDraft);
      saveBookingDraft(updatedDraft);
    }
    isHydratedRef.current = true;
  }, []);

  // Auto-prefill primary saved address once live consumer locations load,
  // unless the user already edited or selected a different pickup address.
  useEffect(() => {
    const primary = initialLocations[0];
    const demoDefault = SAMPLE_PHNOM_PENH_LOCATIONS[0];
    if (!primary || primary.id === demoDefault.id) return;

    setFormData((prev) => {
      const stillOnDemoDefault =
        prev.pickup.id === demoDefault.id &&
        prev.pickup.address === demoDefault.address;
      if (!stillOnDemoDefault) return prev;
      return { ...prev, pickup: primary };
    });
  }, [initialLocations]);

  // Debounced auto-save to sessionStorage so page reloads do not discard seller edits
  useEffect(() => {
    if (!isHydratedRef.current) return;
    const timer = setTimeout(() => {
      saveBookingDraft(formData);
    }, 350);
    return () => clearTimeout(timer);
  }, [formData]);

  // Live estimated delivery fee (accounting for extra stops and delivery speed)
  const feeQuote = useMemo(() => {
    const additionalStops = Math.max(0, (formData.dropoffs?.length || 1) - 1);
    return calculateMockFee(
      formData.pickup.coordinates,
      formData.dropoff.coordinates,
      additionalStops,
      formData.deliveryOption || 'instant',
    );
  }, [
    formData.pickup.coordinates,
    formData.dropoff.coordinates,
    formData.dropoffs,
    formData.deliveryOption,
  ]);

  const recentBookings = useMemo(
    () => Object.values(MOCK_BOOKING_DETAILS).slice(0, 3),
    [],
  );

  const handleBookAgain = useCallback(
    (order: BookingOrder) => {
      setFormData(createPrefillFromOrder(order));
      setErrors({});
      toast.success(tBooking('prefilledFromBooking', { id: order.id }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [tBooking],
  );

  const handleResetForm = useCallback(() => {
    clearBookingDraft();
    setFormData(createDefaultBookingForm(initialLocations[0]));
    setErrors({});
    toast.info(tBooking('formResetBanner'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialLocations, tBooking]);

  const handleOptimizeRoute = useCallback(() => {
    const currentStops = formData.dropoffs || [
      {
        id: 'stop-1',
        recipient: formData.recipient,
        dropoff: formData.dropoff,
      },
    ];
    if (currentStops.length <= 1) return;

    const result = optimizeStopOrder(formData.pickup.coordinates, currentStops);
    if (result.changed) {
      const optimized = result.optimizedStops;
      setFormData((prev) => ({
        ...prev,
        dropoffs: optimized,
        recipient: optimized[0]?.recipient || prev.recipient,
        dropoff: optimized[0]?.dropoff || prev.dropoff,
        cod: syncCodWithDropoffs(optimized, prev.cod),
      }));
      toast.success(
        tBooking('routeOptimizedBanner', { km: result.savedKm.toFixed(1) }),
      );
    } else {
      toast.info(tBooking('routeAlreadyOptimalBanner'));
    }
  }, [
    formData.dropoffs,
    formData.pickup.coordinates,
    formData.recipient,
    formData.dropoff,
    tBooking,
  ]);

  const handleConfirmClick = () => {
    const validationErrors = validateBookingFormData(formData);
    setErrors(validationErrors);
    const errorList = Object.values(validationErrors);
    if (errorList.length > 0) {
      toast.error(errorList[0]);
      return;
    }

    setIsSubmitting(true);
    const normalized = normalizeBookingPhones(formData);
    saveBookingDraft(normalized);
    router.push('/booking/review');
  };

  const formSharedProps = {
    formData,
    onChangePickup: (pickup: PickupLocation) => {
      setFormData((prev) => ({ ...prev, pickup }));
      setErrors((prev) => ({
        ...prev,
        'pickup.address': '',
        'pickup.senderPhone': '',
      }));
    },
    onChangeDropoff: (dropoff: DropoffLocation) => {
      setFormData((prev) => ({ ...prev, dropoff }));
      setErrors((prev) => ({ ...prev, 'dropoff.address': '' }));
    },
    onChangeRecipient: (recipient: RecipientInfo) => {
      setFormData((prev) => ({ ...prev, recipient }));
      setErrors((prev) => ({
        ...prev,
        'recipient.name': '',
        'recipient.phoneNumber': '',
      }));
    },
    onChangeDropoffs: (dropoffs: DropoffStop[]) => {
      setFormData((prev) => ({
        ...prev,
        dropoffs,
        recipient: dropoffs[0]?.recipient || prev.recipient,
        dropoff: dropoffs[0]?.dropoff || prev.dropoff,
        cod: syncCodWithDropoffs(dropoffs, prev.cod),
      }));
      setErrors((prev) => {
        const next: Record<string, string> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (
            !key.startsWith('dropoffs.') &&
            key !== 'dropoff.address' &&
            key !== 'recipient.phoneNumber'
          ) {
            next[key] = val;
          }
        }
        return next;
      });
    },
    onChangeParcel: (parcel: ParcelInfo) =>
      setFormData((prev) => ({ ...prev, parcel })),
    onChangeDeliveryOption: (deliveryOption: DeliverySpeedOption) =>
      setFormData((prev) => ({ ...prev, deliveryOption })),
    onChangeDeliverySchedule: (deliverySchedule: DeliverySchedule) =>
      setFormData((prev) => ({ ...prev, deliverySchedule })),
    onOptimizeRoute: handleOptimizeRoute,
    onSubmit: handleConfirmClick,
    isSubmitting,
    errors,
    fee: feeQuote.totalDeliveryFee,
    savedLocations: initialLocations,
  };

  return {
    formData,
    setFormData,
    feeQuote,
    recentBookings,
    handleBookAgain,
    handleResetForm,
    formSharedProps,
  };
}
