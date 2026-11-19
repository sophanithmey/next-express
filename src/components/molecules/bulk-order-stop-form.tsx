'use client';

import React from 'react';
import {
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
} from '@/features/booking/types/booking-types';
import { PhoneInput } from './phone-input';
import { StopOptionalPills } from './stop-optional-pills';
import { StopOptionalDrawer } from './stop-optional-drawer';
import { Check, MapPin, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BulkOrderStopFormProps {
  stop: DropoffStop;
  index: number;
  canRemove: boolean;
  canFinishEditing: boolean;
  idPrefix: string;
  addressError?: string;
  phoneError?: string;
  codError?: string;
  resolvedImage?: string;
  isCodOpen: boolean;
  showName: boolean;
  showNote: boolean;
  hasNote: boolean;
  onCloseEditor: () => void;
  onRemove: () => void;
  onOpenMap: () => void;
  onAddressChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onToggleCod: () => void;
  onToggleName: () => void;
  onToggleNote: () => void;
  onUpdate: (
    recipient: RecipientInfo,
    dropoff: DropoffLocation,
    codAmount?: number,
  ) => void;
}

export function BulkOrderStopForm({
  stop,
  index,
  canRemove,
  canFinishEditing,
  idPrefix,
  addressError,
  phoneError,
  codError,
  resolvedImage,
  isCodOpen,
  showName,
  showNote,
  hasNote,
  onCloseEditor,
  onRemove,
  onOpenMap,
  onAddressChange,
  onPhoneChange,
  onToggleCod,
  onToggleName,
  onToggleNote,
  onUpdate,
}: BulkOrderStopFormProps) {
  const tRecipient = useTranslations('Recipient');
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  return (
    <div className="bg-slate-50/70 px-5 py-4 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[11px] font-extrabold text-slate-950">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-slate-900">
            {tCommon('stop')} {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {canFinishEditing && (
            <button
              type="button"
              onClick={onCloseEditor}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-2.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>{tCommon('done')}</span>
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer"
              aria-label={tCommon('remove')}
              title={tCommon('remove')}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="sm:col-span-7 space-y-1">
          <label className="block text-xs font-semibold text-slate-800">
            {tBooking('bulkColAddress')}{' '}
            <span className="text-danger-500 font-bold">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={stop.dropoff.address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder={tRecipient('addressPlaceholder')}
              className={`flex-1 h-9 rounded-xl border bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition shadow-2xs ${
                addressError
                  ? 'border-danger-500 focus:ring-danger-500/20'
                  : 'border-slate-300 hover:border-slate-400 focus:border-secondary-500 focus:ring-secondary-500/20'
              }`}
            />
            <button
              type="button"
              onClick={onOpenMap}
              title={tRecipient('pinOnMap')}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              <span>{tCommon('map')}</span>
            </button>
          </div>
          {addressError && (
            <p className="text-xs text-danger-600 font-medium">
              {addressError}
            </p>
          )}
        </div>

        <div className="sm:col-span-5">
          <PhoneInput
            label={tBooking('bulkColPhone')}
            required
            sizeVariant="sm"
            value={stop.recipient.phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={tRecipient('phonePlaceholder')}
            error={phoneError}
          />
        </div>
      </div>

      <StopOptionalPills
        codAmount={stop.codAmount}
        recipientName={stop.recipient.name}
        hasNote={hasNote}
        hasImage={Boolean(resolvedImage)}
        showCod={isCodOpen}
        showName={showName}
        showNote={showNote}
        onToggleCod={onToggleCod}
        onToggleName={onToggleName}
        onToggleNote={onToggleNote}
      />

      <StopOptionalDrawer
        idPrefix={idPrefix}
        stop={stop}
        resolvedImage={resolvedImage}
        isCodOpen={isCodOpen}
        isNameOpen={showName}
        isNoteOpen={showNote}
        codError={codError}
        onUpdate={onUpdate}
      />
    </div>
  );
}
