'use client';

import React from 'react';
import { PickupLocation } from '../types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '../data/mock-booking-data';
import { useBookingPage } from '../hooks/use-booking-page';
import { BookingForm } from '@/components/organisms/booking-form';
import { BookingSummary } from '@/components/organisms/booking-summary';
import { BookingPageHeader } from './booking-page-header';
import { SavedDraftsModal } from '@/components/molecules/saved-drafts-modal';
import { RecentBookingsList } from './recent-bookings-list';
import { GuestHelpCard } from './guest-help-card';

interface BookingPageClientProps {
  initialLocations?: (PickupLocation & { tag?: string })[];
}

export function BookingPageClient({
  initialLocations = SAMPLE_PHNOM_PENH_LOCATIONS,
}: BookingPageClientProps) {
  const {
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
  } = useBookingPage(initialLocations);

  return (
    <div className='space-y-6'>
      <BookingPageHeader
        layoutMode={layoutMode}
        onLayoutChange={handleLayoutChange}
        isAuthenticated={isAuthenticated}
        sellerName={sellerName}
        savedDraftsCount={savedDrafts.length}
        onOpenDrafts={openDraftsModal}
        onResetForm={handleResetForm}
      />

      {/* 2-Column Responsive Workspace */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-12 items-start'>
        <div className='lg:col-span-7 xl:col-span-8'>
          <BookingForm
            {...formSharedProps}
            onCreateLocation={handleCreateSavedLocation}
            layoutMode={layoutMode}
            onSaveDraft={handleSaveDraft}
            isSavingDraft={isSavingDraft}
          />
        </div>

        <div className='lg:col-span-5 xl:col-span-4 space-y-5'>
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
            <RecentBookingsList
              bookings={recentBookings}
              onBookAgain={handleBookAgain}
            />
          ) : (
            <GuestHelpCard />
          )}
        </div>
      </div>

      {/* Saved Drafts Dialog */}
      <SavedDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={closeDraftsModal}
        drafts={savedDrafts}
        onResumeDraft={handleResumeDraft}
        onDraftDeleted={refreshDrafts}
      />
    </div>
  );
}
