'use client';

import React from 'react';
import { Bookmark, Compass, MapPin, X } from 'lucide-react';
import { GeoCoordinates, PickupLocation } from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { cn } from '@/lib/cn';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { LocationPickerMapTab } from './location-picker-map-tab';
import { LocationPickerSavedList, SavedLocationItem } from './location-picker-saved-list';
import { LocationPickerCreateForm } from './location-picker-create-form';

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
  title = 'Pin Location on Google Map',
  initialCoords = { lat: 11.5512, lng: 104.9256 },
  savedLocations = [],
  defaultContact = '',
  onCreateLocation,
}: LocationPickerModalProps) {
  const picker = useLocationPicker({
    isOpen,
    initialCoords,
    selectedAddress,
    defaultContact,
    savedLocations,
    onSelect,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl sm:max-w-xl lg:max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500">Search saved location, pin on Google Map, or save a new address</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => picker.setActiveTab('map')}
            className={cn(
              'flex-1 py-1.5 px-2 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer',
              picker.activeTab === 'map' ? 'bg-white text-brand-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Compass className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>Google Map &amp; Pin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              picker.setIsPickingForNew(false);
              picker.setActiveTab('saved');
            }}
            className={cn(
              'flex-1 py-1.5 px-2 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer',
              picker.activeTab === 'saved' ? 'bg-white text-brand-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Bookmark className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>Saved Locations ({savedLocations.length})</span>
          </button>
        </div>

        {picker.activeTab === 'map' && (
          <LocationPickerMapTab
            pinnedCoords={picker.pinnedCoords}
            pinAddress={picker.pinAddress}
            linkInput={picker.linkInput}
            suggestions={picker.suggestions}
            isLocating={picker.isLocating}
            isResolvingLink={picker.isResolvingLink}
            detectedStatus={picker.detectedStatus}
            linkError={picker.linkError}
            isPickingForNewLocation={picker.isPickingForNew}
            onLinkChange={picker.handleLinkChange}
            onPinAddressChange={picker.setPinAddress}
            onClearLinkInput={picker.clearLinkInput}
            onSelectSuggestion={(loc) => {
              if (loc.coordinates) picker.setPinnedCoords(loc.coordinates);
              picker.setPinAddress(loc.address);
              picker.setLinkInput(loc.name);
              picker.setSuggestions([]);
              picker.setDetectedStatus(null);
            }}
            onUseCurrentLocation={picker.handleUseCurrentLocation}
            onNudge={(dLat, dLng) => {
              const next = {
                lat: Number((picker.pinnedCoords.lat + dLat).toFixed(5)),
                lng: Number((picker.pinnedCoords.lng + dLng).toFixed(5)),
              };
              picker.setPinnedCoords(next);
              picker.setPinAddress(`Google Pin (${next.lat.toFixed(4)}, ${next.lng.toFixed(4)})`);
              picker.setDetectedStatus(null);
            }}
            onQuickChipSelect={(chip) => {
              picker.setPinnedCoords(chip.coords);
              picker.setPinAddress(chip.addr);
              picker.setLinkInput(chip.label);
              picker.setDetectedStatus(null);
            }}
            onConfirmPin={picker.handleConfirmPin}
            onSavePinToLocations={onCreateLocation ? () => picker.handleOpenCreate(true) : undefined}
          />
        )}

        {picker.activeTab === 'saved' && !picker.isCreating && (
          <LocationPickerSavedList
            locations={savedLocations}
            selectedAddress={selectedAddress}
            highlightedLocationId={picker.highlightedId}
            onSelect={onSelect}
            onAddNew={onCreateLocation ? () => picker.handleOpenCreate(false) : undefined}
            onPreviewOnMap={(loc) => {
              if (loc.coordinates) picker.setPinnedCoords(loc.coordinates);
              picker.setPinAddress(loc.address);
              picker.setLinkInput(loc.name);
              picker.setActiveTab('map');
            }}
            onClose={onClose}
          />
        )}

        {picker.activeTab === 'saved' && picker.isCreating && onCreateLocation && (
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
            onSubmit={async (input) => {
              const result = await onCreateLocation(input);
              if (result === 'auth_required') {
                picker.setAwaitingAuthSave(true);
                return result;
              }
              picker.setHighlightedId(result.id);
              picker.setIsCreating(false);
              picker.setIsPickingForNew(false);
              return result;
            }}
          />
        )}
      </div>
    </div>
  );
}
