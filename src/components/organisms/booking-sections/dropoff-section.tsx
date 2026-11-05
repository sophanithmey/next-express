'use client';

import React from 'react';
import {
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
} from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Navigation, User, Phone, Map, Plus, Trash2, MapPin } from 'lucide-react';

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
          : 'Buyer contact and delivery address'
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
          const nameError = errors[`dropoffs.${index}.name`] || (index === 0 ? errors['recipient.name'] : '');
          const phoneError =
            errors[`dropoffs.${index}.phoneNumber`] || (index === 0 ? errors['recipient.phoneNumber'] : '');
          const addressError =
            errors[`dropoffs.${index}.address`] || (index === 0 ? errors['dropoff.address'] : '');

          return (
            <div
              key={stop.id}
              className={`space-y-3 rounded-xl transition-all ${
                isMultiDrop
                  ? 'border border-slate-200 bg-slate-50/60 p-4 shadow-2xs'
                  : ''
              }`}
            >
              {/* Stop Header (Shown if multi-drop) */}
              {isMultiDrop && (
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white font-mono">
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Destination {index + 1}
                      {stop.recipient.name ? ` — ${stop.recipient.name}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenMap(index)}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" /> Map
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:bg-rose-50 px-1.5 py-0.5 rounded transition"
                      aria-label={`Remove destination ${index + 1}`}
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`recipient-name-${index}`} className="text-xs">
                    Recipient Name *
                  </Label>
                  <Input
                    id={`recipient-name-${index}`}
                    placeholder="Customer Full Name"
                    value={stop.recipient.name}
                    onChange={(e) =>
                      handleUpdateStop(
                        index,
                        { ...stop.recipient, name: e.target.value },
                        stop.dropoff
                      )
                    }
                    leftIcon={<User className="h-4 w-4 text-slate-400" />}
                    error={Boolean(nameError)}
                    className="h-10 text-xs"
                  />
                  {nameError && (
                    <p className="text-xs font-medium text-rose-600">{nameError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`recipient-phone-${index}`} className="text-xs">
                    Recipient Phone Number *
                  </Label>
                  <Input
                    id={`recipient-phone-${index}`}
                    type="tel"
                    placeholder="012 998 877"
                    value={stop.recipient.phoneNumber}
                    onChange={(e) =>
                      handleUpdateStop(
                        index,
                        { ...stop.recipient, phoneNumber: e.target.value },
                        stop.dropoff
                      )
                    }
                    leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                    error={Boolean(phoneError)}
                    className="h-10 text-xs font-mono"
                  />
                  {phoneError && (
                    <p className="text-xs font-medium text-rose-600">{phoneError}</p>
                  )}
                </div>
              </div>

              {/* Drop-off Address */}
              <div className="space-y-1">
                <Label htmlFor={`dropoff-address-${index}`} className="text-xs">
                  Drop-off Address / Street *
                </Label>
                <Input
                  id={`dropoff-address-${index}`}
                  placeholder="House / Street, Sangkat, Khan, Phnom Penh"
                  value={stop.dropoff.address}
                  onChange={(e) =>
                    handleUpdateStop(
                      index,
                      stop.recipient,
                      { ...stop.dropoff, address: e.target.value }
                    )
                  }
                  leftIcon={<Navigation className="h-4 w-4 text-emerald-600" />}
                  error={Boolean(addressError)}
                  className="h-10 text-xs"
                />
                {addressError && (
                  <p className="text-xs font-medium text-rose-600">{addressError}</p>
                )}
              </div>
            </div>
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
            <span>+ Add Another Drop-off Destination (Multi-Drop)</span>
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Couriers will deliver packages sequentially to each destination in a single dispatch.
          </p>
        </div>
      </div>
    </FormSection>
  );
}
