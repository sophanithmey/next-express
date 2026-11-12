'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { BookingLayoutMode } from '@/components/molecules/booking-layout-switcher';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '../data/mock-booking-data';
import { CreateSavedLocationInput } from '../schemas/location-schema';
import { PickupLocation, SavedBookingDraft } from '../types/booking-types';
import { useBookingDrafts } from './use-booking-drafts';
import { useBookingPageForm } from './use-booking-page-form';
import { SavedLocationItem, useSavedLocations } from './use-saved-locations';

const BOOKING_LAYOUT_STORAGE_KEY = 'express_seller_booking_layout';

/**
 * Coordinates booking page state, drafts, saved locations, layout mode, and auth-gated actions.
 */
export function useBookingPage(
  initialLocations: (PickupLocation & {
    tag?: string;
  })[] = SAMPLE_PHNOM_PENH_LOCATIONS,
) {
  const tBooking = useTranslations('Booking');
  const locale = useLocale();
  const { isAuthenticated, user, openAuthModal } = useAuthState();
  const [layoutMode, setLayoutMode] = useState<BookingLayoutMode>('vertical');
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  const { savedLocations, createLocation } = useSavedLocations(
    initialLocations,
    isAuthenticated,
    locale,
  );

  const { savedDrafts, isSavingDraft, saveDraft, refreshDrafts } =
    useBookingDrafts({
      isAuthenticated,
      userId: user?.id,
      locale,
    });

  const {
    formData,
    setFormData,
    feeQuote,
    recentBookings,
    handleBookAgain,
    handleResetForm,
    formSharedProps,
  } = useBookingPageForm(savedLocations);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(BOOKING_LAYOUT_STORAGE_KEY);
    if (saved === 'vertical' || saved === 'horizontal') {
      setLayoutMode(saved);
    }
  }, []);

  const handleLayoutChange = useCallback((mode: BookingLayoutMode) => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKING_LAYOUT_STORAGE_KEY, mode);
    }
  }, []);

  const openDraftsModal = useCallback(() => setIsDraftsModalOpen(true), []);
  const closeDraftsModal = useCallback(() => setIsDraftsModalOpen(false), []);

  const handleSaveDraft = useCallback(() => {
    const doSave = async () => {
      try {
        const saved = await saveDraft(formData);
        setFormData((prev) => ({
          ...prev,
          draftOrderId: saved.orderId || prev.draftOrderId,
        }));
        toast.success(tBooking('draftSavedBanner', { title: saved.title }));
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Unable to save draft right now.',
        );
      }
    };

    if (!isAuthenticated) {
      openAuthModal(() => {
        void doSave();
      });
      return;
    }
    void doSave();
  }, [formData, isAuthenticated, openAuthModal, saveDraft, setFormData, tBooking]);

  const handleResumeDraft = useCallback(
    (draft: SavedBookingDraft) => {
      setFormData(draft.formData);
      toast.success(tBooking('draftLoadedBanner', { title: draft.title }));
      setIsDraftsModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setFormData, tBooking],
  );

  const handleCreateSavedLocation = useCallback(
    async (
      input: CreateSavedLocationInput,
    ): Promise<SavedLocationItem | 'auth_required'> => {
      if (!isAuthenticated) {
        openAuthModal(async (authedUser) => {
          try {
            const created = await createLocation({
              ...input,
              contact: input.contact || authedUser.phoneNumber,
            });
            toast.success(`Saved "${created.name}" to your locations`);
          } catch (err: unknown) {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save location',
            );
          }
        });
        return 'auth_required';
      }

      const created = await createLocation(input);
      toast.success(`Saved "${created.name}" to your locations`);
      return created;
    },
    [createLocation, isAuthenticated, openAuthModal],
  );

  const sellerName = user?.shopName || user?.name || tBooking('defaultSeller');

  return {
    layoutMode,
    isDraftsModalOpen,
    isAuthenticated,
    sellerName,
    savedDrafts,
    isSavingDraft,
    formData,
    feeQuote,
    recentBookings,
    formSharedProps,
    openDraftsModal,
    closeDraftsModal,
    handleLayoutChange,
    handleSaveDraft,
    handleResumeDraft,
    handleResetForm,
    handleBookAgain,
    handleCreateSavedLocation,
    refreshDrafts,
  };
}

