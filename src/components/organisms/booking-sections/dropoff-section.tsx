'use client';

import React from 'react';
import {
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Navigation, AlertCircle } from 'lucide-react';
import { DropoffStopItem } from './dropoff-stop-item';
import { DropoffActionButtons } from '../../molecules/dropoff-action-buttons';
import { DropoffSectionHeaderActions } from '../../molecules/dropoff-section-header-actions';
import { DropoffDragDropOverlay } from '../../molecules/dropoff-drag-drop-overlay';
import { DropoffUploadModal } from '../dropoff-upload-modal';
import { useDropoffSection } from '@/features/booking/hooks/use-dropoff-section';
import { useDropoffUpload } from '@/features/booking/hooks/use-dropoff-upload';
import { calculateTotalStopCod } from '@/features/booking/services/booking-form-helpers';
import { MAX_TOTAL_COD_USD } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface DropoffSectionProps {
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  dropoffs?: DropoffStop[];
  cod?: CodInfo;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
  onOptimizeRoute?: () => void;
  onOpenMap: (stopIndex?: number) => void;
  errors: Record<string, string>;
}

export function DropoffSection({
  dropoff,
  recipient,
  dropoffs,
  cod,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
  onOptimizeRoute,
  onOpenMap,
  errors,
}: DropoffSectionProps) {
  const tRecipient = useTranslations('Recipient');
  const tValidation = useTranslations('Validation');

  const {
    currentStops,
    isMultiDrop,
    maxStops,
    isMaxStopsReached,
    collapsedStops,
    sortableContainerRef,
    handleToggleCollapse,
    handleUpdateStop,
    handleAddStop,
    handleRemoveStop,
    handleBulkApply,
    handleMoveUp,
    handleMoveDown,
  } = useDropoffSection({
    dropoff,
    recipient,
    dropoffs,
    cod,
    onChangeDropoff,
    onChangeRecipient,
    onChangeDropoffs,
  });

  const upload = useDropoffUpload({ onApplyStops: handleBulkApply });

  const totalCod = calculateTotalStopCod(currentStops);
  const isCodOverLimit = totalCod > MAX_TOTAL_COD_USD;
  const codLimitMessage = tValidation('codTotalExceeded', {
    total: totalCod.toFixed(2),
    max: MAX_TOTAL_COD_USD,
  });
  const codBannerError = isCodOverLimit ? codLimitMessage : errors['cod.amount'];

  return (
    <>
      <div
        onDragOver={upload.handleDragOver}
        onDragLeave={upload.handleDragLeave}
        onDrop={upload.handleDrop}
        className="relative"
      >
        <DropoffDragDropOverlay isDragOver={upload.isDragOver} />

        <FormSection
          icon={<Navigation className="h-4 w-4" />}
          iconClassName="bg-brand-50 text-brand-700 border border-brand-200"
          title={tRecipient('title')}
          titleClassName="text-brand-950 font-bold"
          subtitle={
            isMultiDrop
              ? tRecipient('multiSubtitle', { count: currentStops.length })
              : undefined
          }
          action={
            <DropoffSectionHeaderActions
              totalCod={totalCod}
              isCodOverLimit={isCodOverLimit}
              isMultiDrop={isMultiDrop}
              currentStopsCount={currentStops.length}
              maxStops={maxStops}
              onOpenUploadModal={() => upload.setIsModalOpen(true)}
              onOptimizeRoute={onOptimizeRoute}
            />
          }
        >
          {codBannerError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-semibold text-danger-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{codBannerError}</span>
            </div>
          )}

          <div ref={sortableContainerRef} className="space-y-4">
            {currentStops.map((stop, index) => {
              const nameError = errors[`dropoffs.${index}.name`];
              const phoneError =
                errors[`dropoffs.${index}.phoneNumber`] ||
                (index === 0 ? errors['recipient.phoneNumber'] : '');
              const addressError =
                errors[`dropoffs.${index}.address`] ||
                (index === 0 ? errors['dropoff.address'] : '');
              const codError =
                errors[`dropoffs.${index}.codAmount`] ||
                (isCodOverLimit && (stop.codAmount ?? 0) > 0 ? codLimitMessage : undefined);

              return (
                <DropoffStopItem
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isMultiDrop={isMultiDrop}
                  isCollapsed={Boolean(collapsedStops[stop.id])}
                  onToggleCollapse={() => handleToggleCollapse(stop.id)}
                  onUpdateStop={handleUpdateStop}
                  onRemoveStop={handleRemoveStop}
                  onOpenMap={onOpenMap}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isLast={index === currentStops.length - 1}
                  nameError={nameError}
                  phoneError={phoneError}
                  addressError={addressError}
                  codError={codError}
                />
              );
            })}

            <DropoffActionButtons
              onAddStop={handleAddStop}
              onFileUpload={upload.handleFileUpload}
              onOpenUploadModal={() => upload.setIsModalOpen(true)}
              disabled={isMaxStopsReached}
              maxStops={maxStops}
              isProcessing={upload.isProcessing}
            />
          </div>
        </FormSection>
      </div>

      <DropoffUploadModal
        isOpen={upload.isModalOpen}
        onClose={() => upload.setIsModalOpen(false)}
        inputText={upload.inputText}
        onChangeInputText={upload.setInputText}
        previewStops={upload.previewStops}
        isProcessing={upload.isProcessing}
        onFileUpload={upload.handleFileUpload}
        onLoadSample={upload.handleLoadSample}
        onDownloadXlsx={upload.handleDownloadXlsx}
        onDownloadCsv={upload.handleDownloadCsv}
        onApply={upload.handleApplyPreview}
      />
    </>
  );
}
