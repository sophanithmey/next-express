'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { BulkOrderDraft } from '@/features/booking/services/bulk-order-parser';
import { useBulkOrderCard } from '@/features/booking/hooks/use-bulk-order-card';
import { MAX_TOTAL_COD_USD } from '@/lib/constants';
import { BulkOrderCardHeader } from '../molecules/bulk-order-card-header';
import { BulkOrderCardFooter } from '../molecules/bulk-order-card-footer';
import { BulkOrderStopRow } from '../molecules/bulk-order-stop-row';

interface BulkOrderCardProps {
  order: BulkOrderDraft;
  index: number;
  estimatedFee: number;
  isExpanded: boolean;
  errors?: Record<string, string>;
  showErrors: boolean;
  onToggleExpand: () => void;
  onAddStop: () => void;
  onUpdateStop: (stopIndex: number, updated: DropoffStop) => void;
  onRemoveStop: (stopIndex: number) => void;
  onRemoveOrder: () => void;
  onOptimizeRoute: () => void;
  onOpenStopMap: (stopIndex: number) => void;
}

export function BulkOrderCard({
  order,
  index,
  estimatedFee,
  isExpanded,
  errors = {},
  showErrors,
  onToggleExpand,
  onAddStop,
  onUpdateStop,
  onRemoveStop,
  onRemoveOrder,
  onOptimizeRoute,
  onOpenStopMap,
}: BulkOrderCardProps) {
  const tValidation = useTranslations('Validation');

  const {
    orderCod,
    isCodOverLimit,
    hasOrderErrors,
    hasVisibleError,
    isMaxStops,
    recipientPreview,
    getStopErrors,
  } = useBulkOrderCard({ order, errors, showErrors });

  return (
    <div
      className={`rounded-2xl border bg-white transition shadow-2xs overflow-hidden ${
        hasVisibleError
          ? 'border-danger-300 ring-1 ring-danger-200/70'
          : 'border-slate-200/90'
      }`}
    >
      <BulkOrderCardHeader
        index={index}
        stopsCount={order.stops.length}
        orderCod={orderCod}
        isCodOverLimit={isCodOverLimit}
        estimatedFee={estimatedFee}
        isExpanded={isExpanded}
        hasOrderErrors={hasOrderErrors}
        recipientPreview={recipientPreview}
        onToggleExpand={onToggleExpand}
        onRemoveOrder={onRemoveOrder}
      />

      {isExpanded && (
        <div className="border-t border-slate-100">
          {isCodOverLimit && (
            <div className="mx-5 mt-3.5 flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-semibold text-danger-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {tValidation('codTotalExceeded', {
                  total: orderCod.toFixed(2),
                  max: MAX_TOTAL_COD_USD,
                })}
              </span>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {order.stops.map((stop, stopIdx) => {
              const { phoneError, addressError, codError } = getStopErrors(
                stop,
                stopIdx,
              );
              return (
                <BulkOrderStopRow
                  key={stop.id}
                  stop={stop}
                  index={stopIdx}
                  isLast={stopIdx === order.stops.length - 1}
                  canRemove={order.stops.length > 1}
                  onChange={(updated) => onUpdateStop(stopIdx, updated)}
                  onRemove={() => onRemoveStop(stopIdx)}
                  onOpenMap={() => onOpenStopMap(stopIdx)}
                  phoneError={phoneError}
                  addressError={addressError}
                  codError={codError}
                />
              );
            })}
          </div>

          <BulkOrderCardFooter
            stopsCount={order.stops.length}
            isMaxStops={isMaxStops}
            onAddStop={onAddStop}
            onOptimizeRoute={onOptimizeRoute}
          />
        </div>
      )}
    </div>
  );
}
