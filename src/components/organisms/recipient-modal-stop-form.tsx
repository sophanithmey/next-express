'use client';

import React from 'react';
import {
  RecipientInfo,
  DropoffLocation,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { DropoffStopFields } from '../molecules/dropoff-stop-fields';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RecipientModalStopFormProps {
  currentStop: DropoffStop;
  activeTab: number;
  totalStops: number;
  onUpdateCurrentStop: (
    recipient: RecipientInfo,
    dropoff: DropoffLocation,
    codAmount?: number
  ) => void;
  onAddStop: () => void;
  onOpenMap: (index?: number) => void;
  errors?: Record<string, string>;
}

export function RecipientModalStopForm({
  currentStop,
  activeTab,
  totalStops,
  onUpdateCurrentStop,
  onAddStop,
  onOpenMap,
  errors = {},
}: RecipientModalStopFormProps) {
  const tBooking = useTranslations('Booking');

  const phoneError =
    errors[`dropoffs.${activeTab}.phoneNumber`] ||
    (activeTab === 0 ? errors['recipient.phoneNumber'] : undefined);
  const addressError =
    errors[`dropoffs.${activeTab}.address`] ||
    (activeTab === 0 ? errors['dropoff.address'] : undefined);
  const nameError = errors[`dropoffs.${activeTab}.name`];
  const codError = errors[`dropoffs.${activeTab}.codAmount`];

  return (
    <div className="space-y-4">
      <DropoffStopFields
        key={currentStop.id || `modal-stop-${activeTab}`}
        idPrefix={`modal-stop-${activeTab}`}
        stop={currentStop}
        onUpdate={onUpdateCurrentStop}
        onOpenMap={() => onOpenMap(activeTab)}
        phoneError={phoneError}
        addressError={addressError}
        nameError={nameError}
        codError={codError}
      />

      {/* Multi-Drop Adder if only 1 stop currently */}
      {totalStops === 1 && (
        <button
          type="button"
          onClick={onAddStop}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-primary-300 bg-primary-50/50 hover:bg-primary-100/70 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5 text-slate-900" />
          <span>{tBooking('addDestination')}</span>
        </button>
      )}
    </div>
  );
}
