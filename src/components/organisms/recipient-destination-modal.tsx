'use client';

import React from 'react';
import {
  RecipientInfo,
  DropoffLocation,
  DropoffStop,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { useRecipientDestinationModal } from '@/features/booking/hooks/use-recipient-destination-modal';
import { RecipientModalStopForm } from './recipient-modal-stop-form';
import { RecipientModalStopTabs } from '../molecules/recipient-modal-stop-tabs';
import { BulkDropoffModal } from './bulk-dropoff-modal';
import { DeleteStopConfirmModal } from '../molecules/delete-stop-confirm-modal';
import { Button } from '../atoms/button';
import { X, Check, Layers, AlertCircle } from 'lucide-react';
import { calculateTotalStopCod } from '@/features/booking/services/booking-form-helpers';
import { MAX_TOTAL_COD_USD } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface RecipientDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: RecipientInfo;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  orderCod?: CodInfo;
  onSaveDestination: (
    rec: RecipientInfo,
    drop: DropoffLocation,
    stops?: DropoffStop[]
  ) => void;
  onOpenMap: (index?: number) => void;
  errors?: Record<string, string>;
  initialStopIndex?: number;
}

export function RecipientDestinationModal({
  isOpen,
  onClose,
  recipient,
  dropoff,
  dropoffs,
  orderCod,
  onSaveDestination,
  onOpenMap,
  errors = {},
  initialStopIndex = 0,
}: RecipientDestinationModalProps) {
  const tRecipient = useTranslations('Recipient');
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');

  const {
    activeTab,
    setActiveTab,
    stops,
    currentStop,
    isBulkModalOpen,
    setIsBulkModalOpen,
    mergedErrors,
    hasStopError,
    pendingDeleteIndex,
    pendingDeletePreview,
    handleUpdateCurrentStop,
    handleAddStop,
    requestRemoveStop,
    confirmRemoveStop,
    cancelRemoveStop,
    handleApplyBulkStops,
    handleSave,
  } = useRecipientDestinationModal({
    isOpen,
    onClose,
    recipient,
    dropoff,
    dropoffs,
    orderCod,
    onSaveDestination,
    externalErrors: errors,
    initialStopIndex,
  });

  if (!isOpen || stops.length === 0 || !currentStop) return null;

  const totalCod = calculateTotalStopCod(stops);
  const isCodOverLimit = totalCod > MAX_TOTAL_COD_USD;
  const codLimitMessage = tValidation('codTotalExceeded', {
    total: totalCod.toFixed(2),
    max: MAX_TOTAL_COD_USD,
  });
  const modalCodBanner = isCodOverLimit ? codLimitMessage : mergedErrors['cod.amount'];
  const stopErrors =
    isCodOverLimit && (currentStop.codAmount ?? 0) > 0 && !mergedErrors[`dropoffs.${activeTab}.codAmount`]
      ? { ...mergedErrors, [`dropoffs.${activeTab}.codAmount`]: codLimitMessage }
      : mergedErrors;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-xl sm:max-w-xl lg:max-w-2xl max-h-[92vh] min-h-[520px] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/70">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {tRecipient('modalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {stops.length > 1
                  ? tRecipient('multiSubtitle', { count: stops.length })
                  : tRecipient('singleSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer"
                title={tBooking('bulkImportSpreadsheet')}
              >
                <Layers className="h-3.5 w-3.5 text-brand-600" />
                <span>{tBooking('bulkImport')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label={tCommon('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Multi-Drop Destination Tabs */}
          <RecipientModalStopTabs
            stops={stops}
            activeTab={activeTab}
            hasStopError={hasStopError}
            onSelectTab={setActiveTab}
            onRequestRemoveStop={requestRemoveStop}
            onAddStop={handleAddStop}
          />

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {modalCodBanner && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-semibold text-danger-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalCodBanner}</span>
              </div>
            )}
            <RecipientModalStopForm
              currentStop={currentStop}
              activeTab={activeTab}
              totalStops={stops.length}
              onUpdateCurrentStop={handleUpdateCurrentStop}
              onAddStop={handleAddStop}
              onOpenMap={onOpenMap}
              errors={stopErrors}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/70">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={<Check className="h-4 w-4" />}
            >
              {tRecipient('saveDestination')}
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Dropoff Import Dialog */}
      <BulkDropoffModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onApplyStops={handleApplyBulkStops}
      />

      {/* Dirty Stop Delete Confirmation Alert */}
      <DeleteStopConfirmModal
        isOpen={pendingDeleteIndex !== null}
        stopNumber={(pendingDeleteIndex ?? 0) + 1}
        stopPreview={pendingDeletePreview}
        onClose={cancelRemoveStop}
        onConfirm={confirmRemoveStop}
      />
    </>
  );
}
