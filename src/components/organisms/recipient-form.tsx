'use client';

import React, { useEffect, useState } from 'react';
import { FormField } from '../molecules/form-field';
import { Input } from '../atoms/input';
import { PhoneInput } from '../molecules/phone-input';
import { Checkbox } from '../atoms/checkbox';
import { RecipientCard } from '../molecules/recipient-card';
import { RecipientInfo, RecipientRecord } from '@/features/booking/types/booking-types';
import { User, Phone, Sparkles } from 'lucide-react';

interface RecipientFormProps {
  recipient: RecipientInfo;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  isBookingOnBehalf: boolean;
  onToggleBookingOnBehalf: (checked: boolean) => void;
  senderName?: string;
  onChangeSenderName: (val: string) => void;
  senderPhone?: string;
  onChangeSenderPhone: (val: string) => void;
  onAutofillAddress?: (address: string, coords: { lat: number; lng: number }) => void;
}

export function RecipientForm({
  recipient,
  onChangeRecipient,
  isBookingOnBehalf,
  onToggleBookingOnBehalf,
  senderName,
  onChangeSenderName,
  senderPhone,
  onChangeSenderPhone,
  onAutofillAddress,
}: RecipientFormProps) {
  const [matchingRecipients, setMatchingRecipients] = useState<RecipientRecord[]>([]);

  // Search past recipients when typing phone or name
  useEffect(() => {
    const query = recipient.phoneNumber || recipient.name;
    if (!query || query.length < 3) {
      setMatchingRecipients([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recipients?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const list = await res.json();
          setMatchingRecipients(list.slice(0, 3));
        }
      } catch {
        setMatchingRecipients([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [recipient.phoneNumber, recipient.name]);

  const handleSelectPastRecipient = (record: RecipientRecord) => {
    onChangeRecipient({
      ...recipient,
      name: record.name,
      phoneNumber: record.phoneNumber,
    });
    if (record.lastAddress && record.lastCoordinates && onAutofillAddress) {
      onAutofillAddress(record.lastAddress, record.lastCoordinates);
    }
    setMatchingRecipients([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Recipient Information</h3>
        <p className="text-xs text-slate-500">
          Enter customer details or search by phone to autofill past delivery history
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Recipient Phone Number" required>
            <PhoneInput
              value={recipient.phoneNumber}
              onChange={(e) =>
                onChangeRecipient({ ...recipient, phoneNumber: e.target.value })
              }
              placeholder="12 998 877"
              required
            />
          </FormField>

          <FormField label="Recipient Full Name" required>
            <Input
              value={recipient.name}
              onChange={(e) =>
                onChangeRecipient({ ...recipient, name: e.target.value })
              }
              placeholder="e.g., Sokha Chan"
              leftIcon={<User className="h-4 w-4" />}
              required
            />
          </FormField>
        </div>

        {matchingRecipients.length > 0 && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span>Smart Autofill Suggestion</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {matchingRecipients.map((past) => (
                <RecipientCard
                  key={past.id}
                  recipient={past}
                  onSelect={handleSelectPastRecipient}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Alternate Phone Number (Optional)">
            <Input
              value={recipient.alternatePhone || ''}
              onChange={(e) =>
                onChangeRecipient({ ...recipient, alternatePhone: e.target.value })
              }
              placeholder="Optional secondary phone"
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </FormField>

          <FormField label="Delivery Note for Driver (Optional)">
            <Input
              value={recipient.notes || ''}
              onChange={(e) =>
                onChangeRecipient({ ...recipient, notes: e.target.value })
              }
              placeholder="e.g., Call upon arrival, leave at gate"
            />
          </FormField>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Checkbox
            label="Book on behalf of another store or individual"
            description="Enable if you want the parcel label and SMS updates to show a custom sender contact"
            checked={isBookingOnBehalf}
            onChange={(e) => onToggleBookingOnBehalf(e.target.checked)}
          />

          {isBookingOnBehalf && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <FormField label="Custom Sender Name">
                <Input
                  value={senderName || ''}
                  onChange={(e) => onChangeSenderName(e.target.value)}
                  placeholder="e.g. VIP Boutique Partner"
                />
              </FormField>
              <FormField label="Custom Sender Phone">
                <Input
                  value={senderPhone || ''}
                  onChange={(e) => onChangeSenderPhone(e.target.value)}
                  placeholder="012 000 000"
                />
              </FormField>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

