'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PickupLocation } from '../types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '../data/mock-booking-data';
import { useBookingPageForm } from '../hooks/use-booking-page-form';
import { useSavedLocations, SavedLocationItem } from '../hooks/use-saved-locations';
import { CreateSavedLocationInput } from '../schemas/location-schema';
import { BookingForm } from '@/components/organisms/booking-form';
import { BookingSummary } from '@/components/organisms/booking-summary';
import { BookingLayoutMode } from '@/components/molecules/booking-layout-switcher';
import { BookingPageHeader } from './booking-page-header';
import { SavedDraftsModal } from '@/components/molecules/saved-drafts-modal';
import {
  fetchApiSavedDrafts,
  getUserSavedDrafts,
  saveApiBookingDraft,
  SavedBookingDraft,
} from '../services/booking-draft-service';
import { RecentBookingsList } from './recent-bookings-list';
import { GuestHelpCard } from './guest-help-card';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { toast } from 'sonner';

interface BookingPageClientProps {
  initialLocations?: (PickupLocation & { tag?: string })[];
}

export function BookingPageClient({
  initialLocations = SAMPLE_PHNOM_PENH_LOCATIONS,
}: BookingPageClientProps) {
  const tBooking = useTranslations('Booking');
  const locale = useLocale();
  const { isAuthenticated, user, openAuthModal } = useAuthState();
  const [layoutMode, setLayoutMode] = useState<BookingLayoutMode>('vertical');
  const [savedDrafts, setSavedDrafts] = useState<SavedBookingDraft[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const { savedLocations, createLocation } = useSavedLocations(
    initialLocations,
    isAuthenticated,
    locale,
  );

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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('express_seller_booking_layout');
      if (saved === 'vertical' || saved === 'horizontal') setLayoutMode(saved);
    }
  }, []);

  const refreshDrafts = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedDrafts([]);
      return;
    }
    const localDrafts = getUserSavedDrafts(user?.id);
    try {
      const apiDrafts = await fetchApiSavedDrafts(locale);
      setSavedDrafts(apiDrafts.length > 0 ? apiDrafts : localDrafts);
    } catch {
      setSavedDrafts(localDrafts);
    }
  }, [isAuthenticated, locale, user?.id]);

  useEffect(() => {
    void refreshDrafts();
  }, [refreshDrafts]);

  const handleLayoutChange = (mode: BookingLayoutMode) => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') localStorage.setItem('express_seller_booking_layout', mode);
  };

  const handleSaveDraft = () => {
    const doSave = async () => {
      setIsSavingDraft(true);
      try {
        const saved = await saveApiBookingDraft(formData, locale);
        setFormData((prev) => ({
          ...prev,
          draftOrderId: saved.orderId || prev.draftOrderId,
        }));
        setSavedDrafts((prev) => [
          saved,
          ...prev.filter((d) => d.id !== saved.id),
        ]);
        toast.success(tBooking('draftSavedBanner', { title: saved.title }));
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : 'Unable to save draft right now.',
        );
      } finally {
        setIsSavingDraft(false);
      }
    };

    if (!isAuthenticated) {
      openAuthModal(() => {
        void doSave();
      });
      return;
    }
    void doSave();
  };

  const handleResumeDraft = (draft: SavedBookingDraft) => {
    setFormData(draft.formData);
    toast.success(tBooking('draftLoadedBanner', { title: draft.title }));
    setIsDraftsModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="space-y-6">
      <BookingPageHeader
        layoutMode={layoutMode}
        onLayoutChange={handleLayoutChange}
        isAuthenticated={isAuthenticated}
        sellerName={sellerName}
        savedDraftsCount={savedDrafts.length}
        onOpenDrafts={() => setIsDraftsModalOpen(true)}
        onResetForm={handleResetForm}
      />

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <BookingForm
            {...formSharedProps}
            onCreateLocation={handleCreateSavedLocation}
            layoutMode={layoutMode}
            onSaveDraft={handleSaveDraft}
            isSavingDraft={isSavingDraft}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <BookingSummary
            pickup={formData.pickup}
            dropoff={formData.dropoff}
            dropoffs={formData.dropoffs}
            recipient={formData.recipient}
            deliveryOption={formData.deliveryOption || 'instant'}
            parcel={formData.parcel}
            cod={formData.cod}
            feeQuote={feeQuote}
          />

          {isAuthenticated ? (
            <RecentBookingsList bookings={recentBookings} onBookAgain={handleBookAgain} />
          ) : (
            <GuestHelpCard />
          )}
        </div>
      </div>

      {/* Saved Drafts Dialog */}
      <SavedDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        drafts={savedDrafts}
        onResumeDraft={handleResumeDraft}
        onDraftDeleted={refreshDrafts}
      />
    </div>
  );
}
