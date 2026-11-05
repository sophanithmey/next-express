'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { X, MapPin, Search, Navigation, Compass, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../atoms/button';
import { LocationPickerPresets } from './location-picker-presets';

const DeliveryMap = dynamic(
  () => import('../organisms/delivery-map').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading Google Map…
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
  // Handles @11.5564,104.9282, q=11.5564,104.9282, or 11.5564, 104.9282
  const match = input.match(/@?(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
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
  const [isLocating, setIsLocating] = useState(false);

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

  const handleNudge = (deltaLat: number, deltaLng: number) => {
    const nextCoords = {
      lat: Number((pinnedCoords.lat + deltaLat).toFixed(5)),
      lng: Number((pinnedCoords.lng + deltaLng).toFixed(5)),
    };
    setPinnedCoords(nextCoords);
    setPinAddress(`Google Pin (${nextCoords.lat.toFixed(4)}, ${nextCoords.lng.toFixed(4)})`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        };
        setPinnedCoords(coords);
        setPinAddress(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}), Phnom Penh`);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirmPin = () => {
    const finalAddress =
      pinAddress.trim() ||
      `Google Pin (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)}), Phnom Penh`;

    onSelect({
      name: finalAddress.split(',')[0] || 'Google Pinned Location',
      address: finalAddress,
      coordinates: pinnedCoords,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>{title}</span>
            </h3>
            <p className="text-[11px] text-slate-500">View on Google Maps, paste pin link, or pick zone</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition">
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
              activeTab === 'map' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            <span>Google Map &amp; Pin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={cn(
              'flex-1 py-1.5 font-bold rounded-lg transition text-center flex items-center justify-center gap-1.5',
              activeTab === 'presets' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Navigation className="h-3.5 w-3.5 text-emerald-600" />
            <span>Phnom Penh Zones</span>
          </button>
        </div>

        {/* Tab 1: Google Map Pinning */}
        {activeTab === 'map' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="Paste Google Maps link or coordinates (e.g. 11.5564, 104.9282)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex-shrink-0"
              >
                <span>🎯</span>
                <span>{isLocating ? 'Locating…' : 'GPS'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <DeliveryMap dropoffCoords={pinnedCoords} isDraggableDropoff={false} className="h-56 w-full" />
              {/* Micro Nudge Controls */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-xs rounded-lg p-1 border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-600 px-1">Nudge:</span>
                <button type="button" onClick={() => handleNudge(0.0008, 0)} title="Nudge North" className="p-1 rounded hover:bg-slate-100 text-slate-700">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => handleNudge(-0.0008, 0)} title="Nudge South" className="p-1 rounded hover:bg-slate-100 text-slate-700">
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => handleNudge(0, -0.0008)} title="Nudge West" className="p-1 rounded hover:bg-slate-100 text-slate-700">
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => handleNudge(0, 0.0008)} title="Nudge East" className="p-1 rounded hover:bg-slate-100 text-slate-700">
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span>Google Pin: <strong className="font-mono text-slate-800">{pinnedCoords.lat.toFixed(4)}, {pinnedCoords.lng.toFixed(4)}</strong></span>
              <span className="text-emerald-700 font-semibold">✓ Google Maps Ready</span>
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

        {/* Tab 2: Phnom Penh Zones */}
        {activeTab === 'presets' && (
          <LocationPickerPresets selectedAddress={selectedAddress} onSelect={onSelect} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
