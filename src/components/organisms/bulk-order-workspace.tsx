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
import { applyConfirmedPickupLocation } from '@/features/booking/services/booking-location-helper';
import { getSpeedOptionFees } from '@/features/booking/services/pricing-service';
import { PickupSection } from './booking-sections/pickup-section';
import { DeliveryOptionsSection } from './booking-sections/delivery-options-section';
import { BulkOrderListSection } from './bulk-order-list-section';
import { BulkOrderSummary } from './bulk-order-summary';
import { BulkOrderResultView } from './bulk-order-result-view';
import { BulkUploadOrderModal } from './bulk-upload-order-modal';
import { BulkOrderActionBar } from '../molecules/bulk-order-action-bar';
import { LocationPickerModal } from '../molecules/location-picker-modal';
import { useTranslations } from 'next-intl';

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

type MapTarget =
  | { type: 'pickup' }
  | { type: 'stop'; orderId: string; stopIndex: number }
  | null;

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
  const tPickup = useTranslations('Pickup');
  const tRecipient = useTranslations('Recipient');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<MapTarget>(null);

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

  const pickupErrors = bulk.hasAttemptedSubmit ? bulk.validation.pickupErrors : {};

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Shared Pickup, Delivery Speed, and Bulk Orders List */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <PickupSection
            pickup={pickup}
            onChangePickup={onChangePickup}
            onOpenMap={() => setMapTarget({ type: 'pickup' })}
            isCod={bulk.batchSummary.totalCod > 0}
            error={pickupErrors['pickup.address']}
            phoneError={pickupErrors['pickup.senderPhone']}
            bankNameError={pickupErrors['pickup.settlementAccountName']}
            bankNumberError={pickupErrors['pickup.settlementAccountNumber']}
            savedLocations={savedLocations}
          />

          <BulkOrderListSection
            orders={bulk.orders}
            perOrderFees={bulk.batchSummary.perOrder}
            orderErrors={bulk.validation.orderErrors}
            showErrors={bulk.hasAttemptedSubmit}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onLoadSample={bulk.handleLoadSample}
            onDirectFileUpload={(file) => void bulk.handleDirectFileUpload(file)}
            onAddOrder={bulk.handleAddOrder}
            onRemoveOrder={bulk.handleRemoveOrder}
            onClearOrders={bulk.handleClearOrders}
            onAddStop={bulk.handleAddStop}
            onUpdateStop={bulk.handleUpdateStop}
            onRemoveStop={bulk.handleRemoveStop}
            onOptimizeOrderRoute={bulk.handleOptimizeOrderRoute}
            onOpenStopMap={(orderId, stopIndex) =>
              setMapTarget({ type: 'stop', orderId, stopIndex })
            }
          />

          <DeliveryOptionsSection
            selectedOption={deliveryOption}
            onChangeOption={onChangeDeliveryOption}
            schedule={deliverySchedule}
            onChangeSchedule={onChangeDeliverySchedule}
            instantFee={instantFee}
            sameDayFee={sameDayFee}
            scheduledFee={scheduledFee}
          />

          <BulkOrderActionBar
            ordersCount={bulk.orders.length}
            totalStops={bulk.batchSummary.totalStops}
            subtotalFee={bulk.batchSummary.totalFee}
            finalPayableFee={bulk.finalPayableFee}
            discountAmount={bulk.discountAmount}
            appliedPromo={bulk.appliedPromo}
            tipAmount={bulk.tipAmount}
            totalCod={bulk.batchSummary.totalCod}
            invalidOrderCount={bulk.validation.invalidOrderCount}
            hasPickupErrors={Object.keys(bulk.validation.pickupErrors).length > 0}
            isSubmitting={bulk.isSubmitting}
            submitProgress={bulk.submitProgress}
            onSubmit={bulk.handleSubmitBatch}
          />
        </div>

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
      <LocationPickerModal
        isOpen={mapTarget !== null}
        onClose={() => setMapTarget(null)}
        title={
          mapTarget?.type === 'pickup'
            ? tPickup('selectLocation')
            : tRecipient('destinationIndex', {
                index: (mapTarget?.stopIndex ?? 0) + 1,
              })
        }
        selectedAddress={
          mapTarget?.type === 'pickup'
            ? pickup.address
            : targetStop?.dropoff.address || ''
        }
        initialCoords={
          mapTarget?.type === 'pickup'
            ? pickup.coordinates
            : targetStop?.dropoff.coordinates || pickup.coordinates
        }
        savedLocations={savedLocations}
        defaultContact={mapTarget?.type === 'pickup' ? pickup.senderPhone || '' : ''}
        onCreateLocation={onCreateLocation}
        onSelect={(loc) => {
          if (!mapTarget) return;
          if (mapTarget.type === 'pickup') {
            onChangePickup(applyConfirmedPickupLocation(pickup, loc));
            return;
          }
          if (targetStop) {
            bulk.handleUpdateStop(mapTarget.orderId, mapTarget.stopIndex, {
              ...targetStop,
              dropoff: {
                ...targetStop.dropoff,
                address: loc.address,
                coordinates: {
                  lat: Number(loc.coordinates.lat),
                  lng: Number(loc.coordinates.lng),
                },
                placeId: loc.placeId,
              },
            });
          }
        }}
      />
    </>
  );
}
