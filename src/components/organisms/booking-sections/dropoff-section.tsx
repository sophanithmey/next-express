'use client';

import React from 'react';
import {
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Navigation, Layers, Route } from 'lucide-react';
import { DropoffStopItem } from './dropoff-stop-item';
import { DropoffAddStopButton } from './dropoff-add-stop-button';
import { BulkDropoffModal } from '../bulk-dropoff-modal';
import { useDropoffSection } from '@/features/booking/hooks/use-dropoff-section';
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
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  const {
    currentStops,
    isMultiDrop,
    isBulkModalOpen,
    setIsBulkModalOpen,
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

  return (
    <FormSection
      icon={<Navigation className="h-4 w-4" />}
      iconClassName="bg-brand-50 text-brand-700 border border-brand-200"
      title={tRecipient('title')}
      titleClassName="text-brand-950 font-bold"
      subtitle={
        isMultiDrop
          ? tRecipient('multiSubtitle', { count: currentStops.length })
          : tRecipient('singleSubtitle')
      }
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {isMultiDrop && (
            <span className="text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-1 rounded-md border border-brand-200">
              {currentStops.length} {tCommon('stops')}
            </span>
          )}
          {isMultiDrop && onOptimizeRoute && (
            <button
              type="button"
              onClick={onOptimizeRoute}
              className="flex items-center gap-1.5 text-xs font-semibold text-secondary-700 hover:text-secondary-900 bg-secondary-50 hover:bg-secondary-100 px-2.5 py-1.5 rounded-lg border border-secondary-200 shadow-2xs transition cursor-pointer"
              title={tBooking('optimizeRouteTitle')}
            >
              <Route className="h-3.5 w-3.5 text-secondary-600" />
              <span>{tBooking('optimizeRoute')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
            title={tBooking('bulkImportSpreadsheet')}
          >
            <Layers className="h-3.5 w-3.5 text-brand-600" />
            <span>{tBooking('bulkImport')}</span>
          </button>
        </div>
      }
    >
      <div ref={sortableContainerRef} className="space-y-4">
        {currentStops.map((stop, index) => {
          const nameError = errors[`dropoffs.${index}.name`];
          const phoneError =
            errors[`dropoffs.${index}.phoneNumber`] ||
            (index === 0 ? errors['recipient.phoneNumber'] : '');
          const addressError =
            errors[`dropoffs.${index}.address`] ||
            (index === 0 ? errors['dropoff.address'] : '');
          const codError = errors[`dropoffs.${index}.codAmount`];

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

        <DropoffAddStopButton onAddStop={handleAddStop} />
      </div>

      <BulkDropoffModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onApplyStops={handleBulkApply}
      />
    </FormSection>
  );
}
