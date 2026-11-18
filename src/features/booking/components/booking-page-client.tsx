'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PickupLocation } from '../types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '../data/mock-booking-data';
import { useBookingPage } from '../hooks/use-booking-page';
import { BookingForm } from '@/components/organisms/booking-form';
import { BookingSummary } from '@/components/organisms/booking-summary';
import { BulkOrderWorkspace } from '@/components/organisms/bulk-order-workspace';
import {
  BookingPageHeader,
  BookingWorkspaceMode,
} from './booking-page-header';
import { SavedDraftsModal } from '@/components/molecules/saved-drafts-modal';
import { RecentBookingsList } from './recent-bookings-list';
import { GuestHelpCard } from './guest-help-card';
import { clearBulkOrdersDraft } from '../services/booking-draft-service';

const BOOKING_WORKSPACE_MODE_KEY = 'express_seller_booking_workspace_mode';

interface BookingPageClientProps {
  initialLocations?: (PickupLocation & { tag?: string })[];
}

export function BookingPageClient({
  initialLocations = SAMPLE_PHNOM_PENH_LOCATIONS,
}: BookingPageClientProps) {
  const [workspaceMode, setWorkspaceMode] =
    useState<BookingWorkspaceMode>('single');
  const [bulkResetNonce, setBulkResetNonce] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(BOOKING_WORKSPACE_MODE_KEY);
      if (saved === 'single' || saved === 'bulk') {
        setWorkspaceMode(saved);
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, []);

  const handleWorkspaceModeChange = useCallback((mode: BookingWorkspaceMode) => {
    setWorkspaceMode(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BOOKING_WORKSPACE_MODE_KEY, mode);
      } catch {
        // Ignore storage quota errors
      }
    }
  }, []);

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

  const handleResetWorkspace = useCallback(() => {
    if (workspaceMode === 'bulk') {
      clearBulkOrdersDraft();
      setBulkResetNonce((n) => n + 1);
    }
    handleResetForm();
  }, [workspaceMode, handleResetForm]);

  return (
    <div className="space-y-6">
      <BookingPageHeader
        workspaceMode={workspaceMode}
        onWorkspaceModeChange={handleWorkspaceModeChange}
        layoutMode={layoutMode}
        onLayoutChange={handleLayoutChange}
        isAuthenticated={isAuthenticated}
        sellerName={sellerName}
        savedDraftsCount={savedDrafts.length}
        onOpenDrafts={openDraftsModal}
        onResetForm={handleResetWorkspace}
      />

      {workspaceMode === 'bulk' ? (
        <BulkOrderWorkspace
          key={bulkResetNonce}
          pickup={formData.pickup}
          onChangePickup={formSharedProps.onChangePickup}
          deliveryOption={formData.deliveryOption || 'instant'}
          onChangeDeliveryOption={formSharedProps.onChangeDeliveryOption}
          deliverySchedule={formData.deliverySchedule}
          onChangeDeliverySchedule={formSharedProps.onChangeDeliverySchedule}
          savedLocations={formSharedProps.savedLocations}
          onCreateLocation={handleCreateSavedLocation}
        />
      ) : (
        /* Single Order: 2-Column Responsive Workspace */
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
              <RecentBookingsList
                bookings={recentBookings}
                onBookAgain={handleBookAgain}
              />
            ) : (
              <GuestHelpCard />
            )}
          </div>
        </div>
      )}

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
