'use client';

import React from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { useBulkOrderStopRow } from '@/features/booking/hooks/use-bulk-order-stop-row';
import { BulkOrderStopSummary } from './bulk-order-stop-summary';
import { BulkOrderStopForm } from './bulk-order-stop-form';

interface BulkOrderStopRowProps {
  stop: DropoffStop;
  index: number;
  isLast: boolean;
  canRemove: boolean;
  onChange: (updated: DropoffStop) => void;
  onRemove: () => void;
  onOpenMap: () => void;
  phoneError?: string;
  addressError?: string;
  codError?: string;
}

/**
 * Pure presentation stop item inside a BulkOrderCard.
 * Displays as a scannable 2-line route row by default and expands inline when editing,
 * blank, or carrying a validation error.
 */
export function BulkOrderStopRow({
  stop,
  index,
  isLast,
  canRemove,
  onChange,
  onRemove,
  onOpenMap,
  phoneError,
  addressError,
  codError,
}: BulkOrderStopRowProps) {
  const {
    idPrefix,
    showEditor,
    canFinishEditing,
    isCodOpen,
    showName,
    showNote,
    resolvedImage,
    formattedPhone,
    hasCod,
    hasNote,
    openEditor,
    closeEditor,
    handleUpdate,
    handleAddressChange,
    handlePhoneChange,
    toggleCod,
    toggleName,
    toggleNote,
  } = useBulkOrderStopRow({
    stop,
    onChange,
    phoneError,
    addressError,
    codError,
  });

  if (!showEditor) {
    return (
      <BulkOrderStopSummary
        stop={stop}
        index={index}
        isLast={isLast}
        canRemove={canRemove}
        formattedPhone={formattedPhone}
        hasCod={hasCod}
        hasNote={hasNote}
        onOpenEditor={openEditor}
        onRemove={onRemove}
      />
    );
  }

  return (
    <BulkOrderStopForm
      stop={stop}
      index={index}
      canRemove={canRemove}
      canFinishEditing={canFinishEditing}
      idPrefix={idPrefix}
      addressError={addressError}
      phoneError={phoneError}
      codError={codError}
      resolvedImage={resolvedImage}
      isCodOpen={isCodOpen}
      showName={showName}
      showNote={showNote}
      hasNote={hasNote}
      onCloseEditor={closeEditor}
      onRemove={onRemove}
      onOpenMap={onOpenMap}
      onAddressChange={handleAddressChange}
      onPhoneChange={handlePhoneChange}
      onToggleCod={toggleCod}
      onToggleName={toggleName}
      onToggleNote={toggleNote}
      onUpdate={handleUpdate}
    />
  );
}
