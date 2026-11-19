'use client';

import React, { useState } from 'react';
import {
  DeliverySchedule,
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { SavedLocationItem } from '../molecules/location-picker-saved-list';
import { useBulkOrderBooking } from '@/features/booking/hooks/use-bulk-order-booking';
import { getSpeedOptionFees } from '@/features/booking/services/pricing-service';
import { BulkOrderWorkspaceMain } from './bulk-order-workspace-main';
import { BulkOrderSummary } from './bulk-order-summary';
import { BulkOrderResultView } from './bulk-order-result-view';
import { BulkUploadOrderModal } from './bulk-upload-order-modal';
import {
  BulkMapTarget,
  BulkOrderLocationModal,
} from '../molecules/bulk-order-location-modal';

interface BulkOrderWorkspaceProps {
  pickup: PickupLocation;
  onChangePickup: (pickup: PickupLocation) => void;
  deliveryOption: DeliverySpeedOption;
  onChangeDeliveryOption: (option: DeliverySpeedOption) => void;
  deliverySchedule?: DeliverySchedule;
  onChangeDeliverySchedule: (schedule: DeliverySchedule) => void;
  savedLocations?: (PickupLocation & { tag?: string })[];
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

export function BulkOrderWorkspace({
  pickup,
  onChangePickup,
  deliveryOption,
  onChangeDeliveryOption,
  deliverySchedule,
  onChangeDeliverySchedule,
  savedLocations,
  onCreateLocation,
}: BulkOrderWorkspaceProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<BulkMapTarget>(null);

  const bulk = useBulkOrderBooking({
    pickup,
    onChangePickup,
    deliveryOption,
    onChangeDeliveryOption,
    deliverySchedule,
    onChangeDeliverySchedule,
  });

  if (bulk.submissionResults) {
    return (
      <BulkOrderResultView
        results={bulk.submissionResults}
        pickup={pickup}
        deliveryOption={deliveryOption}
        paymentMethod={bulk.selectedPayment}
        onRetryFailed={bulk.handleRetryFailed}
        onStartNewBatch={bulk.handleStartNewBatch}
      />
    );
  }

  const baseOrderFee =
    bulk.orders.length > 0
      ? Math.round((bulk.batchSummary.totalFee / bulk.orders.length) * 100) / 100
      : 1.75;
  const { instantFee, sameDayFee, scheduledFee } = getSpeedOptionFees(
    baseOrderFee,
    deliveryOption,
  );

  const targetOrder =
    mapTarget?.type === 'stop'
      ? bulk.orders.find((o) => o.id === mapTarget.orderId)
      : undefined;
  const targetStop =
    mapTarget?.type === 'stop' ? targetOrder?.stops[mapTarget.stopIndex] : undefined;

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Shared Pickup, Delivery Speed, and Bulk Orders List */}
        <BulkOrderWorkspaceMain
          pickup={pickup}
          onChangePickup={onChangePickup}
          deliveryOption={deliveryOption}
          onChangeDeliveryOption={onChangeDeliveryOption}
          deliverySchedule={deliverySchedule}
          onChangeDeliverySchedule={onChangeDeliverySchedule}
          savedLocations={savedLocations}
          bulk={bulk}
          instantFee={instantFee}
          sameDayFee={sameDayFee}
          scheduledFee={scheduledFee}
          onOpenPickupMap={() => setMapTarget({ type: 'pickup' })}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenStopMap={(orderId, stopIndex) =>
            setMapTarget({ type: 'stop', orderId, stopIndex })
          }
        />

        {/* Right Column: Batch Summary, Voucher, Rider Tip & Payment Methods */}
        <div className="lg:col-span-5 xl:col-span-4">
          <BulkOrderSummary
            pickup={pickup}
            deliveryOption={deliveryOption}
            ordersCount={bulk.orders.length}
            totalStops={bulk.batchSummary.totalStops}
            totalFee={bulk.batchSummary.totalFee}
            finalPayableFee={bulk.finalPayableFee}
            totalCod={bulk.batchSummary.totalCod}
            perOrder={bulk.batchSummary.perOrder}
            invalidOrderCount={bulk.validation.invalidOrderCount}
            hasPickupErrors={Object.keys(bulk.validation.pickupErrors).length > 0}
            appliedPromo={bulk.appliedPromo}
            discountAmount={bulk.discountAmount}
            onApplyPromo={bulk.handleApplyPromo}
            onRemovePromo={bulk.handleRemovePromo}
            tipAmount={bulk.tipAmount}
            onChangeTip={bulk.setTipAmount}
            selectedPayment={bulk.selectedPayment}
            onSelectPayment={bulk.setSelectedPayment}
            paymentOptions={bulk.paymentOptions}
            isLoadingOptions={bulk.isLoadingOptions}
            cards={bulk.paymentCardsState.cards}
            selectedCardId={bulk.paymentCardsState.selectedCardId}
            isAuthenticated={bulk.isAuthenticated}
            isLoadingCards={bulk.paymentCardsState.isLoadingCards}
            isMutatingCard={bulk.paymentCardsState.isMutatingCard}
            onSelectCard={bulk.paymentCardsState.setSelectedCardId}
            onAddCard={bulk.handleAddCard}
            onRefreshCards={bulk.paymentCardsState.refreshCards}
            onSetDefaultCard={bulk.paymentCardsState.setDefaultCard}
            onDeleteCard={bulk.paymentCardsState.deleteCard}
            onRequestAuth={() => bulk.openAuthModal()}
          />
        </div>
      </div>

      {/* Upload / Paste / Preview Modal */}
      <BulkUploadOrderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyOrders={bulk.handleImportOrders}
      />

      {/* Map Picker Modal for Shared Pickup or Any Order Stop */}
      <BulkOrderLocationModal
        mapTarget={mapTarget}
        onClose={() => setMapTarget(null)}
        pickup={pickup}
        onChangePickup={onChangePickup}
        targetStop={targetStop}
        savedLocations={savedLocations}
        onCreateLocation={onCreateLocation}
        onUpdateStop={bulk.handleUpdateStop}
      />
    </>
  );
}
