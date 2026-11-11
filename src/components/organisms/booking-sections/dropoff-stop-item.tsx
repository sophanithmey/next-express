'use client';

import React, { useState } from 'react';
import { DropoffStop, RecipientInfo, DropoffLocation } from '@/features/booking/types/booking-types';
import { DropoffStopFields } from '../../molecules/dropoff-stop-fields';
import { DropoffStopHeader } from './dropoff-stop-header';

interface DropoffStopItemProps {
  stop: DropoffStop;
  index: number;
  isMultiDrop: boolean;
  onUpdateStop: (
    index: number,
    recipient: RecipientInfo,
    dropoff: DropoffLocation,
    codAmount?: number
  ) => void;
  onRemoveStop: (index: number) => void;
  onOpenMap: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isLast?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  nameError?: string;
  phoneError?: string;
  addressError?: string;
  codError?: string;
}

export function DropoffStopItem({
  stop,
  index,
  isMultiDrop,
  onUpdateStop,
  onRemoveStop,
  onOpenMap,
  onMoveUp,
  onMoveDown,
  isLast = false,
  isCollapsed,
  onToggleCollapse,
  nameError,
  phoneError,
  addressError,
  codError,
}: DropoffStopItemProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const activeCollapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;
  const toggleCollapse =
    onToggleCollapse || (() => setInternalCollapsed((prev) => !prev));
  const hasError = Boolean(nameError || phoneError || addressError || codError);
  const effectiveCollapsed = isMultiDrop && activeCollapsed && !hasError;

  const summaryText = [stop.dropoff.address?.split(',')[0], stop.recipient.phoneNumber]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      data-id={stop.id}
      className={`space-y-3 rounded-xl transition-all ${
        isMultiDrop
          ? 'border border-slate-200 bg-slate-50/60 p-4 shadow-2xs'
          : ''
      }`}
    >
      {/* Stop Header (Shown if multi-drop) */}
      {isMultiDrop && (
        <DropoffStopHeader
          index={index}
          recipientName={stop.recipient.name}
          codAmount={stop.codAmount}
          summaryText={summaryText}
          isCollapsed={effectiveCollapsed}
          onToggleCollapse={toggleCollapse}
          onRemoveStop={() => onRemoveStop(index)}
          onMoveUp={onMoveUp ? () => onMoveUp(index) : undefined}
          onMoveDown={onMoveDown ? () => onMoveDown(index) : undefined}
          isFirst={index === 0}
          isLast={isLast}
        />
      )}

      {/* Destination Form Fields (Collapsible in multi-drop) */}
      {!effectiveCollapsed && (
        <div className="animate-in fade-in duration-150">
          <DropoffStopFields
            idPrefix={`dropoff-stop-${index}`}
            stop={stop}
            onUpdate={(recipient, dropoff, codAmount) =>
              onUpdateStop(index, recipient, dropoff, codAmount)
            }
            onOpenMap={() => onOpenMap(index)}
            phoneError={phoneError}
            addressError={addressError}
            nameError={nameError}
            codError={codError}
          />
        </div>
      )}
    </div>
  );
}
