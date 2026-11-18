'use client';

import React from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { useBulkOrderStopRow } from '@/features/booking/hooks/use-bulk-order-stop-row';
import { PhoneInput } from './phone-input';
import { StopOptionalPills } from './stop-optional-pills';
import { StopOptionalDrawer } from './stop-optional-drawer';
import { Check, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const tRecipient = useTranslations('Recipient');
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

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
      <div className='group flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/70 transition'>
        <div className='flex flex-col items-center pt-0.5 shrink-0'>
          <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 border border-primary-300 text-[11px] font-bold text-primary-950'>
            {index + 1}
          </span>
          {!isLast && <span className='mt-1.5 h-5 w-px bg-slate-200' />}
        </div>

        <button
          type='button'
          onClick={openEditor}
          className='flex-1 min-w-0 text-left space-y-1 cursor-pointer'
        >
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-xs font-bold text-slate-900 truncate max-w-45'>
              {stop.recipient.name?.trim() || tBooking('defaultRecipientName')}
            </span>
            <span className='text-slate-300'>·</span>
            <span className='text-xs font-mono text-slate-600'>
              {formattedPhone}
            </span>
            {hasCod && (
              <span className='rounded-md bg-amber-50 border border-amber-200/90 px-1.5 py-0.5 text-[11px] font-mono font-bold text-amber-800'>
                COD ${stop.codAmount!.toFixed(2)}
              </span>
            )}
          </div>

          <p className='text-xs text-slate-500 truncate'>
            <span>{stop.dropoff.address}</span>
            {hasNote && (
              <span className='text-slate-400'>
                {' '}
                · {stop.recipient.notes?.trim()}
              </span>
            )}
          </p>
        </button>

        <div className='flex items-center gap-1 shrink-0 pt-0.5'>
          <button
            type='button'
            onClick={openEditor}
            className='inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer'
          >
            <Pencil className='h-3 w-3' />
            <span>{tCommon('edit')}</span>
          </button>
          {canRemove && (
            <button
              type='button'
              onClick={onRemove}
              className='inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer'
              aria-label={tCommon('remove')}
              title={tCommon('remove')}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-slate-50/70 px-5 py-4 space-y-3.5'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[11px] font-extrabold text-slate-950'>
            {index + 1}
          </span>
          <span className='text-xs font-bold text-slate-900'>
            {tCommon('stop')} {index + 1}
          </span>
        </div>

        <div className='flex items-center gap-1.5'>
          {canFinishEditing && (
            <button
              type='button'
              onClick={closeEditor}
              className='inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-2.5 text-xs font-semibold text-slate-700 transition cursor-pointer'
            >
              <Check className='h-3.5 w-3.5 text-emerald-600' />
              <span>{tCommon('done')}</span>
            </button>
          )}
          {canRemove && (
            <button
              type='button'
              onClick={onRemove}
              className='inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition cursor-pointer'
              aria-label={tCommon('remove')}
              title={tCommon('remove')}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-12 gap-3.5'>
        <div className='sm:col-span-7 space-y-1'>
          <label className='block text-xs font-semibold text-slate-800'>
            {tBooking('bulkColAddress')}{' '}
            <span className='text-danger-500 font-bold'>*</span>
          </label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={stop.dropoff.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder={tRecipient('addressPlaceholder')}
              className={`flex-1 h-9 rounded-xl border bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition shadow-2xs ${
                addressError
                  ? 'border-danger-500 focus:ring-danger-500/20'
                  : 'border-slate-300 hover:border-slate-400 focus:border-secondary-500 focus:ring-secondary-500/20'
              }`}
            />
            <button
              type='button'
              onClick={onOpenMap}
              title={tRecipient('pinOnMap')}
              className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer'
            >
              <MapPin className='h-3.5 w-3.5 text-brand-600' />
              <span>{tCommon('map')}</span>
            </button>
          </div>
          {addressError && (
            <p className='text-xs text-danger-600 font-medium'>
              {addressError}
            </p>
          )}
        </div>

        <div className='sm:col-span-5'>
          <PhoneInput
            label={tBooking('bulkColPhone')}
            required
            sizeVariant='sm'
            value={stop.recipient.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
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
        onToggleCod={toggleCod}
        onToggleName={toggleName}
        onToggleNote={toggleNote}
      />

      <StopOptionalDrawer
        idPrefix={idPrefix}
        stop={stop}
        resolvedImage={resolvedImage}
        isCodOpen={isCodOpen}
        isNameOpen={showName}
        isNoteOpen={showNote}
        codError={codError}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
