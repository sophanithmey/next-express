'use client';

import React from 'react';
import {
  DeliverySchedule,
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { PickupSection } from './booking-sections/pickup-section';
import { DeliveryOptionsSection } from './booking-sections/delivery-options-section';
import { BulkOrderListSection } from './bulk-order-list-section';
import { BulkOrderActionBar } from '../molecules/bulk-order-action-bar';
import { useBulkOrderBooking } from '@/features/booking/hooks/use-bulk-order-booking';

interface BulkOrderWorkspaceMainProps {
  pickup: PickupLocation;
  onChangePickup: (pickup: PickupLocation) => void;
  deliveryOption: DeliverySpeedOption;
  onChangeDeliveryOption: (option: DeliverySpeedOption) => void;
  deliverySchedule?: DeliverySchedule;
  onChangeDeliverySchedule: (schedule: DeliverySchedule) => void;
  savedLocations?: (PickupLocation & { tag?: string })[];
  bulk: ReturnType<typeof useBulkOrderBooking>;
  instantFee: number;
  sameDayFee: number;
  scheduledFee: number;
  onOpenPickupMap: () => void;
  onOpenUploadModal: () => void;
  onOpenStopMap: (orderId: string, stopIndex: number) => void;
}

export function BulkOrderWorkspaceMain({
  pickup,
  onChangePickup,
  deliveryOption,
  onChangeDeliveryOption,
  deliverySchedule,
  onChangeDeliverySchedule,
  savedLocations,
  bulk,
  instantFee,
  sameDayFee,
  scheduledFee,
  onOpenPickupMap,
  onOpenUploadModal,
  onOpenStopMap,
}: BulkOrderWorkspaceMainProps) {
  const pickupErrors = bulk.hasAttemptedSubmit ? bulk.validation.pickupErrors : {};

  return (
    <div className="lg:col-span-7 xl:col-span-8 space-y-5">
      <PickupSection
        pickup={pickup}
        onChangePickup={onChangePickup}
        onOpenMap={onOpenPickupMap}
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
        onOpenUploadModal={onOpenUploadModal}
        onLoadSample={bulk.handleLoadSample}
        onDirectFileUpload={(file) => void bulk.handleDirectFileUpload(file)}
        onAddOrder={bulk.handleAddOrder}
        onRemoveOrder={bulk.handleRemoveOrder}
        onReorderOrders={bulk.handleReorderOrders}
        onClearOrders={bulk.handleClearOrders}
        onAddStop={bulk.handleAddStop}
        onUpdateStop={bulk.handleUpdateStop}
        onRemoveStop={bulk.handleRemoveStop}
        onOptimizeOrderRoute={bulk.handleOptimizeOrderRoute}
        onOpenStopMap={onOpenStopMap}
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
  );
}
