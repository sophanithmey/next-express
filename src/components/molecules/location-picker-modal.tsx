'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';
import { X, MapPin, Check, Search, Navigation } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../atoms/button';

const DeliveryMap = dynamic(
  () => import('../organisms/delivery-map').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading interactive map…
      </div>
    ),
  }
);

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: PickupLocation) => void;
  selectedAddress: string;
  title?: string;
  initialCoords?: GeoCoordinates;
}

function parseCoordinatesOrLink(input: string): GeoCoordinates | null {
  const match = input.match(/@?(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedAddress,
  title = 'Pin Location on Google Map',
  initialCoords = { lat: 11.5512, lng: 104.9256 },
}: LocationPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'presets'>('map');
  const [pinnedCoords, setPinnedCoords] = useState<GeoCoordinates>(initialCoords);
  const [pinAddress, setPinAddress] = useState(selectedAddress || '');
  const [linkInput, setLinkInput] = useState('');

  if (!isOpen) return null;

  const handleLinkChange = (val: string) => {
    setLinkInput(val);
    const parsed = parseCoordinatesOrLink(val);
    if (parsed) {
      setPinnedCoords(parsed);
      setPinAddress(`Google Pin (${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)})`);
    } else if (val.trim()) {
      setPinAddress(val);
    }
  };

  const handleConfirmPin = () => {
    const finalAddress =
      pinAddress.trim() ||
      `Google Pin (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)}), Phnom Penh`;

    onSelect({
      name: finalAddress.split(',')[0] || 'Pinned Location',
      address: finalAddress,
      coordinates: pinnedCoords,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">
              Drag pin on map or paste Google Maps pin / link
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={cn(
              'flex-1 py-1.5 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5',
              activeTab === 'map'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pin on Map &amp; Link</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={cn(
              'flex-1 py-1.5 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5',
              activeTab === 'presets'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Navigation className="h-3.5 w-3.5 text-brand-600" />
            <span>Phnom Penh Zones</span>
          </button>
        </div>

        {/* Tab 1: Interactive Map Pinning */}
        {activeTab === 'map' && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder="Paste Google Maps link, coordinates, or street name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 relative">
              <DeliveryMap
                dropoffCoords={pinnedCoords}
                isDraggableDropoff={true}
                onDropoffChange={(coords) => {
                  setPinnedCoords(coords);
                  setPinAddress(
                    `Pinned Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                  );
                }}
                className="h-56 w-full"
              />
              <div className="absolute top-2 left-2 z-[400] bg-white/95 backdrop-blur-xs rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-xs border border-slate-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Drag red pin to exact delivery spot</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span>
                Coordinates: <strong className="font-mono text-slate-700">{pinnedCoords.lat.toFixed(4)}, {pinnedCoords.lng.toFixed(4)}</strong>
              </span>
              <span className="text-emerald-700 font-medium">✓ Ready to dispatch</span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmPin}
              className="w-full py-2.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Confirm Pinned Location
            </Button>
          </div>
        )}

        {/* Tab 2: Preset Locations */}
        {activeTab === 'presets' && (
          <div className="p-3.5 space-y-1.5 max-h-80 overflow-y-auto">
            {SAMPLE_PHNOM_PENH_LOCATIONS.map((loc) => {
              const isChosen =
                selectedAddress.includes(loc.name) || selectedAddress === loc.address;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  className={cn(
                    'w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-3',
                    isChosen
                      ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{loc.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          {loc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{loc.address}</p>
                    </div>
                  </div>
                  {isChosen && <Check className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
