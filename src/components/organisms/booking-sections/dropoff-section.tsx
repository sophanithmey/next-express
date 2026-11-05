'use client';

import React from 'react';
import {
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Map, Plus } from 'lucide-react';
import { DropoffStopItem } from './dropoff-stop-item';

interface DropoffSectionProps {
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  dropoffs?: DropoffStop[];
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
  onOpenMap: (stopIndex?: number) => void;
  errors: Record<string, string>;
}

export function DropoffSection({
  dropoff,
  recipient,
  dropoffs,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
  onOpenMap,
  errors,
}: DropoffSectionProps) {
  // Ensure we always have at least 1 stop
  const currentStops: DropoffStop[] =
    dropoffs && dropoffs.length > 0
      ? dropoffs
      : [{ id: 'stop-1', recipient, dropoff }];

  const handleUpdateStop = (
    index: number,
    updatedRecipient: RecipientInfo,
    updatedDropoff: DropoffLocation
  ) => {
    const nextStops = currentStops.map((stop, i) =>
      i === index ? { ...stop, recipient: updatedRecipient, dropoff: updatedDropoff } : stop
    );

    if (index === 0) {
      onChangeRecipient(updatedRecipient);
      onChangeDropoff(updatedDropoff);
    }

    onChangeDropoffs?.(nextStops);
  };

  const handleAddStop = () => {
    const nextIndex = currentStops.length + 1;
    const newStop: DropoffStop = {
      id: `stop-${Date.now()}`,
      recipient: { name: '', phoneNumber: '', notes: '' },
      dropoff: {
        address: '',
        coordinates: { lat: 11.5512 + nextIndex * 0.005, lng: 104.9256 + nextIndex * 0.005 },
      },
    };

    const nextStops = [...currentStops, newStop];
    onChangeDropoffs?.(nextStops);
  };

  const handleRemoveStop = (index: number) => {
    if (currentStops.length <= 1) return;
    const nextStops = currentStops.filter((_, i) => i !== index);

    if (index === 0 && nextStops.length > 0) {
      onChangeRecipient(nextStops[0].recipient);
      onChangeDropoff(nextStops[0].dropoff);
    }

    onChangeDropoffs?.(nextStops);
  };

  const isMultiDrop = currentStops.length > 1;

  return (
    <FormSection
      number="B"
      title="Drop-off Destinations &amp; Recipients"
      subtitle={
        isMultiDrop
          ? `Multi-drop delivery: ${currentStops.length} customer destinations`
          : 'Customer contact, drop-off address and rider note'
      }
      action={
        <div className="flex items-center gap-2">
          {isMultiDrop && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300">
              {currentStops.length} Stops
            </span>
          )}
          <button
            type="button"
            onClick={() => onOpenMap(0)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
          >
            <Map className="h-3.5 w-3.5" />
            <span>Select on Map / Zone</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {currentStops.map((stop, index) => {
          const nameError = errors[`dropoffs.${index}.name`];
          const phoneError =
            errors[`dropoffs.${index}.phoneNumber`] || (index === 0 ? errors['recipient.phoneNumber'] : '');
          const addressError =
            errors[`dropoffs.${index}.address`] || (index === 0 ? errors['dropoff.address'] : '');

          return (
            <DropoffStopItem
              key={stop.id}
              stop={stop}
              index={index}
              isMultiDrop={isMultiDrop}
              onUpdateStop={handleUpdateStop}
              onRemoveStop={handleRemoveStop}
              onOpenMap={onOpenMap}
              nameError={nameError}
              phoneError={phoneError}
              addressError={addressError}
            />
          );
        })}

        {/* Add Another Drop-off Destination Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddStop}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs group"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white group-hover:scale-105 transition-transform">
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <span>Add Another Drop-off Destination (Multi-Drop)</span>
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Couriers will deliver packages sequentially to each destination in a single dispatch.
          </p>
        </div>
      </div>
    </FormSection>
  );
}
