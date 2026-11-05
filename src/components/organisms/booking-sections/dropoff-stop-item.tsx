'use client';

import React from 'react';
import { DropoffStop, RecipientInfo, DropoffLocation } from '@/features/booking/types/booking-types';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Navigation, User, Phone, MapPin, Trash2, FileText } from 'lucide-react';

interface DropoffStopItemProps {
  stop: DropoffStop;
  index: number;
  isMultiDrop: boolean;
  onUpdateStop: (index: number, recipient: RecipientInfo, dropoff: DropoffLocation) => void;
  onRemoveStop: (index: number) => void;
  onOpenMap: (index: number) => void;
  nameError?: string;
  phoneError?: string;
  addressError?: string;
}

export function DropoffStopItem({
  stop,
  index,
  isMultiDrop,
  onUpdateStop,
  onRemoveStop,
  onOpenMap,
  nameError,
  phoneError,
  addressError,
}: DropoffStopItemProps) {
  return (
    <div
      className={`space-y-3 rounded-xl transition-all ${
        isMultiDrop ? 'border border-slate-200 bg-slate-50/60 p-4 shadow-2xs' : ''
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
              onClick={() => onRemoveStop(index)}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:bg-rose-50 px-1.5 py-0.5 rounded transition cursor-pointer"
              aria-label={`Remove destination ${index + 1}`}
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </div>
      )}

      {/* Recipient Details: Name (Optional) & Phone Number * */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={`recipient-name-${index}`} className="text-xs">
              Recipient Name
            </Label>
            <span className="text-[10px] text-slate-400 font-medium">(Optional)</span>
          </div>
          <Input
            id={`recipient-name-${index}`}
            placeholder="e.g. Sokha Chan (Optional)"
            value={stop.recipient.name}
            onChange={(e) =>
              onUpdateStop(index, { ...stop.recipient, name: e.target.value }, stop.dropoff)
            }
            leftIcon={<User className="h-4 w-4 text-slate-400" />}
            className="h-10 text-xs"
          />
          {nameError && <p className="text-xs font-medium text-rose-600">{nameError}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={`recipient-phone-${index}`} className="text-xs">
              Recipient Phone Number *
            </Label>
          </div>
          <Input
            id={`recipient-phone-${index}`}
            type="tel"
            placeholder="012 998 877"
            value={stop.recipient.phoneNumber}
            onChange={(e) =>
              onUpdateStop(index, { ...stop.recipient, phoneNumber: e.target.value }, stop.dropoff)
            }
            leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
            error={Boolean(phoneError)}
            className="h-10 text-xs font-mono"
          />
          {phoneError && <p className="text-xs font-medium text-rose-600">{phoneError}</p>}
        </div>
      </div>

      {/* Drop-off Address + Google Map Pin Action */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={`dropoff-address-${index}`} className="text-xs">
            Drop-off Address / Street *
          </Label>
          <button
            type="button"
            onClick={() => onOpenMap(index)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-md transition border border-emerald-200"
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Pin on Google Map</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id={`dropoff-address-${index}`}
              placeholder="House / Street, Sangkat, Khan, or paste Google Maps link..."
              value={stop.dropoff.address}
              onChange={(e) =>
                onUpdateStop(index, stop.recipient, { ...stop.dropoff, address: e.target.value })
              }
              leftIcon={<Navigation className="h-4 w-4 text-emerald-600" />}
              error={Boolean(addressError)}
              className="h-10 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => onOpenMap(index)}
            className="h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer"
            title="Pin on Google Map"
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Pin on Map</span>
          </button>
        </div>
        {addressError && <p className="text-xs font-medium text-rose-600">{addressError}</p>}
      </div>

      {/* Rider Note (Optional) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={`rider-note-${index}`} className="text-xs text-slate-600">
            Rider Note
          </Label>
          <span className="text-[10px] text-slate-400 font-medium">(Optional)</span>
        </div>
        <Input
          id={`rider-note-${index}`}
          placeholder="e.g. Call before arrival, leave at security gate, house #12B"
          value={stop.recipient.notes || ''}
          onChange={(e) =>
            onUpdateStop(index, { ...stop.recipient, notes: e.target.value }, stop.dropoff)
          }
          leftIcon={<FileText className="h-4 w-4 text-slate-400" />}
          className="h-9 text-xs"
        />
      </div>
    </div>
  );
}
