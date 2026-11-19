'use client';

import React from 'react';
import {
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { BulkOrderResultBatchCard } from './bulk-order-result-batch-card';
import { BulkOrderResultActionsCard } from './bulk-order-result-actions-card';

interface BulkOrderResultSidebarProps {
  pickup?: PickupLocation;
  deliveryOption?: DeliverySpeedOption;
  paymentMethod?: string;
  succeededCount: number;
  failedCount: number;
  totalStops: number;
  totalFee: number;
  totalCod: number;
  copiedAll: boolean;
  onCopyAllTracking: () => void;
  onRetryFailed: () => void;
  onStartNewBatch: () => void;
}

export function BulkOrderResultSidebar({
  pickup,
  deliveryOption,
  paymentMethod,
  succeededCount,
  failedCount,
  totalStops,
  totalFee,
  totalCod,
  copiedAll,
  onCopyAllTracking,
  onRetryFailed,
  onStartNewBatch,
}: BulkOrderResultSidebarProps) {
  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      <BulkOrderResultBatchCard
        pickup={pickup}
        deliveryOption={deliveryOption}
        paymentMethod={paymentMethod}
        succeededCount={succeededCount}
        totalStops={totalStops}
        totalFee={totalFee}
        totalCod={totalCod}
      />

      <BulkOrderResultActionsCard
        failedCount={failedCount}
        succeededCount={succeededCount}
        copiedAll={copiedAll}
        onRetryFailed={onRetryFailed}
        onCopyAllTracking={onCopyAllTracking}
        onStartNewBatch={onStartNewBatch}
      />
    </div>
  );
}
