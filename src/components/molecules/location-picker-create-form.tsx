'use client';

import React from 'react';
import { ArrowLeft, ChevronDown, Loader2, LocateFixed, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { CreateLocationDraft, useLocationCreateForm } from '@/hooks/use-location-create-form';
import { Button } from '../atoms/button';
import { SavedLocationItem } from './location-picker-saved-list';

export type { CreateLocationDraft };

interface LocationPickerCreateFormProps {
  draft: CreateLocationDraft;
  coordinates: GeoCoordinates;
  isLocating: boolean;
  onDraftChange: (next: CreateLocationDraft) => void;
  onUseCurrentLocation: () => void;
  onPickOnMap: () => void;
  onCancel: () => void;
  onSubmit: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15';

export function LocationPickerCreateForm({
  draft,
  coordinates,
  isLocating,
  onDraftChange,
  onUseCurrentLocation,
  onPickOnMap,
  onCancel,
  onSubmit,
}: LocationPickerCreateFormProps) {
  const tPicker = useTranslations('LocationPicker');
  const tCommon = useTranslations('Common');
  const { showDetails, error, isSubmitting, toggleDetails, updateField, handleSave } =
    useLocationCreateForm({ draft, coordinates, onDraftChange, onSubmit });

  return (
    <form onSubmit={handleSave} className="space-y-3 p-4 sm:p-5 overflow-y-auto max-h-[70vh]">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{tPicker('backToSaved')}</span>
      </button>

      {error && (
        <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs font-medium text-danger-700">
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        <div>
          <label htmlFor="new-loc-name" className="block text-xs font-semibold text-slate-700 mb-1">
            {tPicker('locationNameLabel')} <span className="text-danger-500">*</span>
          </label>
          <input
            id="new-loc-name"
            type="text"
            value={draft.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder={tPicker('locationNamePlaceholder')}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="new-loc-address" className="block text-xs font-semibold text-slate-700 mb-1">
            {tPicker('fullAddressLabel')} <span className="text-danger-500">*</span>
          </label>
          <input
            id="new-loc-address"
            type="text"
            value={draft.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder={tPicker('fullAddressPlaceholder')}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">{tPicker('pinButton')}:</span>{' '}
            <span className="font-mono text-slate-800">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-60"
            >
              {isLocating ? <Loader2 className="h-3 w-3 animate-spin text-brand-600" /> : <LocateFixed className="h-3 w-3 text-brand-600" />}
              <span>{tPicker('useCurrentLocation')}</span>
            </button>
            <button
              type="button"
              onClick={onPickOnMap}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 cursor-pointer"
            >
              <MapPin className="h-3 w-3" />
              <span>{tPicker('pickOnMap')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="new-loc-contact" className="block text-xs font-semibold text-slate-700 mb-1">
              {tPicker('contactPhoneLabel')}{' '}
              <span className="font-normal text-slate-400">({tCommon('optional')})</span>
            </label>
            <input id="new-loc-contact" type="text" value={draft.contact} onChange={(e) => updateField('contact', e.target.value)} placeholder="012 888 999" className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="new-loc-remark" className="block text-xs font-semibold text-slate-700 mb-1">
              {tPicker('riderNoteLabel')}{' '}
              <span className="font-normal text-slate-400">({tCommon('optional')})</span>
            </label>
            <input id="new-loc-remark" type="text" value={draft.remark} onChange={(e) => updateField('remark', e.target.value)} placeholder="..." className={INPUT_CLASS} />
          </div>
        </div>

        <div>
          <button type="button" onClick={toggleDetails} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            <span>
              {tPicker('houseStreetDetails')} ({tCommon('optional')})
            </span>
          </button>
          {showDetails && (
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              <input type="text" value={draft.houseNumber} onChange={(e) => updateField('houseNumber', e.target.value)} placeholder={tPicker('houseNo')} aria-label={tPicker('houseNo')} className={INPUT_CLASS} />
              <input type="text" value={draft.streetNumber} onChange={(e) => updateField('streetNumber', e.target.value)} placeholder={tPicker('streetNo')} aria-label={tPicker('streetNo')} className={INPUT_CLASS} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        <Button type="button" variant="outline" size="md" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold border-slate-200 text-slate-700">
          {tCommon('cancel')}
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5">
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{isSubmitting ? tPicker('savingLocation') : tPicker('saveLocation')}</span>
        </Button>
      </div>
    </form>
  );
}
