'use client';

import React from 'react';
import {
  DeliverySpeedOption,
  PickupLocation,
} from '@/features/booking/types/booking-types';
import { BulkOrderFeeBreakdown } from '@/features/booking/services/bulk-batch-submitter';
import { BulkPaymentMethod } from '@/features/booking/hooks/use-bulk-order-booking';
import { PromoCode } from '@/features/booking/services/promo-service';
import {
  BulkPaymentMethodList,
  BulkPaymentMethodListProps,
} from '../molecules/bulk-payment-method-list';
import { BulkOrderSummaryHeader } from '../molecules/bulk-order-summary-header';
import { BulkOrderSummaryOverview } from '../molecules/bulk-order-summary-overview';
import { BulkOrderFeeList } from '../molecules/bulk-order-fee-list';
import { BulkOrderFeeTotals } from '../molecules/bulk-order-fee-totals';
import { PromoCodeInput } from '../molecules/promo-code-input';
import { RiderTipSelector } from '../molecules/rider-tip-selector';

type BulkSummaryPaymentProps = Omit<
  BulkPaymentMethodListProps,
  'selectedMethod' | 'onSelectMethod' | 'deliveryFee' | 'apiOptions'
> & {
  selectedPayment: BulkPaymentMethod;
  onSelectPayment: (method: BulkPaymentMethod) => void;
  paymentOptions?: BulkPaymentMethodListProps['apiOptions'];
};

interface BulkOrderSummaryProps extends BulkSummaryPaymentProps {
  pickup: PickupLocation;
  deliveryOption: DeliverySpeedOption;
  ordersCount: number;
  totalStops: number;
  totalFee: number;
  finalPayableFee: number;
  totalCod: number;
  perOrder: Record<string, BulkOrderFeeBreakdown>;
  invalidOrderCount: number;
  hasPickupErrors: boolean;
  appliedPromo: PromoCode | null;
  discountAmount: number;
  onApplyPromo: (promo: PromoCode, discount: number) => void;
  onRemovePromo: () => void;
  tipAmount: number;
  onChangeTip: (amount: number) => void;
}

export function BulkOrderSummary({
  pickup,
  deliveryOption,
  ordersCount,
  totalStops,
  totalFee,
  finalPayableFee,
  totalCod,
  perOrder,
  invalidOrderCount,
  hasPickupErrors,
  appliedPromo,
  discountAmount,
  onApplyPromo,
  onRemovePromo,
  tipAmount,
  onChangeTip,
  selectedPayment,
  onSelectPayment,
  paymentOptions,
  ...paymentRest
}: BulkOrderSummaryProps) {
  const isReady =
    ordersCount > 0 && invalidOrderCount === 0 && !hasPickupErrors;

  return (
    <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <BulkOrderSummaryHeader isReady={isReady} />

      <div className="px-5 py-4 space-y-4">
        <BulkOrderSummaryOverview
          pickup={pickup}
          deliveryOption={deliveryOption}
          ordersCount={ordersCount}
          totalStops={totalStops}
        />

        <BulkOrderFeeList perOrder={perOrder} />

        <PromoCodeInput
          compact
          inputId="bulk-promo-input"
          currentFee={totalFee}
          appliedPromo={appliedPromo}
          discountAmount={discountAmount}
          onApplyPromo={onApplyPromo}
          onRemovePromo={onRemovePromo}
        />

        <RiderTipSelector
          compact
          tipAmount={tipAmount}
          onChangeTip={onChangeTip}
        />

        <BulkOrderFeeTotals
          subtotalFee={totalFee}
          appliedPromo={appliedPromo}
          discountAmount={discountAmount}
          tipAmount={tipAmount}
          finalPayableFee={finalPayableFee}
          totalCod={totalCod}
        />

        <BulkPaymentMethodList
          {...paymentRest}
          selectedMethod={selectedPayment}
          onSelectMethod={onSelectPayment}
          deliveryFee={finalPayableFee}
          apiOptions={paymentOptions}
        />
      </div>
    </div>
  );
}
