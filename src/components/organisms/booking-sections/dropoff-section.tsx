'use client';

import React from 'react';
import { DropoffLocation, RecipientInfo } from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Navigation, User, Phone, Map } from 'lucide-react';

interface DropoffSectionProps {
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onOpenMap: () => void;
  errors: Record<string, string>;
}

export function DropoffSection({
  dropoff,
  recipient,
  onChangeDropoff,
  onChangeRecipient,
  onOpenMap,
  errors,
}: DropoffSectionProps) {
  return (
    <FormSection
      number="B"
      title="Drop-off Destination & Recipient"
      subtitle="Buyer contact and delivery address"
      action={
        <button
          type="button"
          onClick={onOpenMap}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
        >
          <Map className="h-3.5 w-3.5" />
          <span>Select on Map / Zone</span>
        </button>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="recipient-name">Recipient Name *</Label>
            <Input
              id="recipient-name"
              placeholder="Customer Full Name"
              value={recipient.name}
              onChange={(e) => onChangeRecipient({ ...recipient, name: e.target.value })}
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
              error={Boolean(errors['recipient.name'])}
            />
            {errors['recipient.name'] && (
              <p className="text-xs font-medium text-rose-600">{errors['recipient.name']}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient-phone">Recipient Phone Number *</Label>
            <Input
              id="recipient-phone"
              type="tel"
              placeholder="012 998 877"
              value={recipient.phoneNumber}
              onChange={(e) =>
                onChangeRecipient({ ...recipient, phoneNumber: e.target.value })
              }
              leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
              error={Boolean(errors['recipient.phoneNumber'])}
            />
            {errors['recipient.phoneNumber'] && (
              <p className="text-xs font-medium text-rose-600">
                {errors['recipient.phoneNumber']}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dropoff-address">Drop-off Address / Street *</Label>
          <Input
            id="dropoff-address"
            placeholder="House / Street, Sangkat, Khan, Phnom Penh"
            value={dropoff.address}
            onChange={(e) => onChangeDropoff({ ...dropoff, address: e.target.value })}
            leftIcon={<Navigation className="h-4 w-4 text-emerald-600" />}
            error={Boolean(errors['dropoff.address'])}
          />
          {errors['dropoff.address'] && (
            <p className="text-xs font-medium text-rose-600">{errors['dropoff.address']}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}

