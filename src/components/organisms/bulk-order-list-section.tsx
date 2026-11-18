'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { BulkOrderDraft } from '@/features/booking/services/bulk-order-parser';
import { BulkOrderFeeBreakdown } from '@/features/booking/services/bulk-batch-submitter';
import { useBulkOrderListSection } from '@/features/booking/hooks/use-bulk-order-list-section';
import { MAX_BULK_ORDERS } from '@/lib/constants';
import { BulkOrderListHeader } from '../molecules/bulk-order-list-header';
import { BulkOrderEmptyDropzone } from '../molecules/bulk-order-empty-dropzone';
import { BulkOrderCard } from './bulk-order-card';

interface BulkOrderListSectionProps {
  orders: BulkOrderDraft[];
  perOrderFees: Record<string, BulkOrderFeeBreakdown>;
  orderErrors: Record<string, Record<string, string>>;
  showErrors: boolean;
  onOpenUploadModal: () => void;
  onLoadSample: () => void;
  onDirectFileUpload: (file: File) => void;
  onAddOrder: () => void;
  onRemoveOrder: (orderId: string) => void;
  onClearOrders: () => void;
  onAddStop: (orderId: string) => void;
  onUpdateStop: (orderId: string, stopIndex: number, updated: DropoffStop) => void;
  onRemoveStop: (orderId: string, stopIndex: number) => void;
  onOptimizeOrderRoute: (orderId: string) => void;
  onOpenStopMap: (orderId: string, stopIndex: number) => void;
}

export function BulkOrderListSection({
  orders,
  perOrderFees,
  orderErrors,
  showErrors,
  onOpenUploadModal,
  onLoadSample,
  onDirectFileUpload,
  onAddOrder,
  onRemoveOrder,
  onClearOrders,
  onAddStop,
  onUpdateStop,
  onRemoveStop,
  onOptimizeOrderRoute,
  onOpenStopMap,
}: BulkOrderListSectionProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  const {
    isOrderExpanded,
    toggleOrder,
    allExpanded,
    handleToggleAll,
    handleFileChange,
    handleDownloadXlsxTemplate,
    handleDownloadCsvTemplate,
    isMaxOrders,
  } = useBulkOrderListSection({
    orders,
    onDirectFileUpload,
  });

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <BulkOrderListHeader
        ordersCount={orders.length}
        allExpanded={allExpanded}
        onToggleAll={handleToggleAll}
        onOpenUploadModal={onOpenUploadModal}
      />

      <div className="space-y-4">
        {orders.length === 0 ? (
          <BulkOrderEmptyDropzone
            onFileChange={handleFileChange}
            onOpenUploadModal={onOpenUploadModal}
            onLoadSample={onLoadSample}
            onDownloadXlsx={handleDownloadXlsxTemplate}
            onDownloadCsv={handleDownloadCsvTemplate}
            onAddOrder={onAddOrder}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <BulkOrderCard
                key={order.id}
                order={order}
                index={idx}
                estimatedFee={perOrderFees[order.id]?.fee ?? 1.75}
                isExpanded={isOrderExpanded(order.id, idx)}
                errors={orderErrors[order.id]}
                showErrors={showErrors}
                onToggleExpand={() => toggleOrder(order.id, idx)}
                onAddStop={() => onAddStop(order.id)}
                onUpdateStop={(stopIdx, updated) =>
                  onUpdateStop(order.id, stopIdx, updated)
                }
                onRemoveStop={(stopIdx) => onRemoveStop(order.id, stopIdx)}
                onRemoveOrder={() => onRemoveOrder(order.id)}
                onOptimizeRoute={() => onOptimizeOrderRoute(order.id)}
                onOpenStopMap={(stopIdx) => onOpenStopMap(order.id, stopIdx)}
              />
            ))}

            {/* Bottom actions: Add Order + Clear All */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={onAddOrder}
                disabled={isMaxOrders}
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary-400 bg-primary-50/50 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-bold text-slate-800 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>
                  {isMaxOrders
                    ? tBooking('bulkMaxOrdersReached', { max: MAX_BULK_ORDERS })
                    : tBooking('bulkAddOrderButton')}
                </span>
              </button>

              <button
                type="button"
                onClick={onClearOrders}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{tCommon('clear')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
