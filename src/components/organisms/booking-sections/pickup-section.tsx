'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { MapPin, User, Phone, Map } from 'lucide-react';

interface PickupSectionProps {
  pickup: PickupLocation;
  onChangePickup: (loc: PickupLocation) => void;
  onOpenMap: () => void;
  error?: string;
}

export function PickupSection({
  pickup,
  onChangePickup,
  onOpenMap,
  error,
}: PickupSectionProps) {
  return (
    <FormSection
      number="A"
      title="Pickup Location"
      subtitle="Where courier should collect the parcel"
      action={
        <button
          type="button"
          onClick={onOpenMap}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 transition"
        >
          <Map className="h-3.5 w-3.5" />
          <span>Select on Map / Hub</span>
        </button>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pickup-address">Pickup Address / Warehouse</Label>
          <Input
            id="pickup-address"
            placeholder="e.g. St 271, Mean Chey, Phnom Penh"
            value={pickup.address}
            onChange={(e) =>
              onChangePickup({
                ...pickup,
                address: e.target.value,
                name: e.target.value.split(',')[0] || 'My Location',
              })
            }
            leftIcon={<MapPin className="h-4 w-4 text-brand-600" />}
            error={Boolean(error)}
          />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="sender-name">Contact Name (Optional)</Label>
            <Input
              id="sender-name"
              placeholder="e.g. Warehouse Dispatcher"
              value={pickup.senderName || ''}
              onChange={(e) => onChangePickup({ ...pickup, senderName: e.target.value })}
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sender-phone">Contact Phone (Optional)</Label>
            <Input
              id="sender-phone"
              type="tel"
              placeholder="012 888 999"
              value={pickup.senderPhone || ''}
              onChange={(e) => onChangePickup({ ...pickup, senderPhone: e.target.value })}
              leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
