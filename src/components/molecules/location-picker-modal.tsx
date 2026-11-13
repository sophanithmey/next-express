'use client';

import React, { useEffect } from 'react';
import { Bookmark, Compass, MapPin, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { LocationPickerMapTab } from './location-picker-map-tab';
import { LocationPickerSavedList, SavedLocationItem } from './location-picker-saved-list';
import { LocationPickerCreateForm } from './location-picker-create-form';
import { cn } from '@/lib/cn';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: PickupLocation) => void;
  selectedAddress: string;
  title?: string;
  initialCoords?: GeoCoordinates;
  savedLocations?: SavedLocationItem[];
  defaultContact?: string;
  onCreateLocation?: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedAddress,
  title,
  initialCoords,
  savedLocations = [],
  defaultContact = '',
  onCreateLocation,
}: LocationPickerModalProps) {
  const tPicker = useTranslations('LocationPicker');
  const tCommon = useTranslations('Common');
  const picker = useLocationPicker({
    isOpen,
    initialCoords,
    selectedAddress,
    savedLocations,
    defaultContact,
    onSelect,
    onClose,
    onCreateLocation,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalTitle = title || tPicker('pickupTitle');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl sm:max-w-xl lg:max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>{modalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500">{tPicker('modalSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon('close')}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => picker.setActiveTab('map')}
            className={cn(
              'flex-1 py-1.5 px-2 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer',
              picker.activeTab === 'map'
                ? 'bg-white text-brand-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Compass className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>{tPicker('tabMap')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              picker.setIsPickingForNew(false);
              picker.setActiveTab('saved');
            }}
            className={cn(
              'flex-1 py-1.5 px-2 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer',
              picker.activeTab === 'saved'
                ? 'bg-white text-brand-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Bookmark className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>{tPicker('tabSaved', { count: savedLocations.length })}</span>
          </button>
        </div>

        {picker.activeTab === 'map' && (
          <LocationPickerMapTab
            pinnedCoords={picker.pinnedCoords}
            pinAddress={picker.pinAddress}
            linkInput={picker.linkInput}
            placeSuggestions={picker.placeSuggestions}
            savedSuggestions={picker.savedSuggestions}
            isLocating={picker.isLocating}
            isSearchingPlaces={picker.isSearchingPlaces}
            isReverseGeocoding={picker.isReverseGeocoding}
            geolocationError={picker.geolocationError}
            isResolvingLink={picker.isResolvingLink}
            detectedStatus={picker.detectedStatus}
            linkError={picker.linkError}
            isPickingForNewLocation={picker.isPickingForNew}
            onLinkChange={picker.handleLinkChange}
            onPinAddressChange={picker.setPinAddress}
            onClearLinkInput={picker.clearLinkInput}
            onSelectPlace={picker.handleSelectPlace}
            onSelectSaved={picker.handleSelectSavedSuggestion}
            onSelectCoordinates={picker.handleMapCoordinateSelect}
            onNudge={picker.nudgePin}
            onQuickChipSelect={picker.handleSelectChip}
            onUseCurrentLocation={picker.handleUseCurrentLocation}
            onConfirmPin={picker.handleConfirmPin}
            onSavePinToLocations={onCreateLocation ? picker.handleOpenCreate : undefined}
          />
        )}

        {picker.activeTab === 'saved' && !picker.isCreating && (
          <LocationPickerSavedList
            locations={savedLocations}
            selectedAddress={selectedAddress}
            highlightedLocationId={picker.highlightedId}
            onSelect={onSelect}
            onAddNew={onCreateLocation ? picker.handleOpenCreate : undefined}
            onPreviewOnMap={picker.handlePreviewOnMap}
            onClose={onClose}
          />
        )}

        {picker.activeTab === 'saved' && picker.isCreating && (
          <LocationPickerCreateForm
            draft={picker.createDraft}
            coordinates={picker.pinnedCoords}
            isLocating={picker.isLocating}
            onDraftChange={picker.setCreateDraft}
            onUseCurrentLocation={picker.handleUseCurrentLocation}
            onPickOnMap={() => {
              picker.setIsPickingForNew(true);
              picker.setActiveTab('map');
            }}
            onCancel={() => {
              picker.setIsCreating(false);
              picker.setIsPickingForNew(false);
            }}
            onSubmit={picker.handleCreateSubmit}
          />
        )}
      </div>
    </div>
  );
}
