'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PickupLocation, DropoffLocation } from '@/features/booking/types/booking-types';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LocationInputGroupProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  savedLocations: PickupLocation[];
  onChangePickup: (pickup: PickupLocation) => void;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
}

const POPULAR_ZONES = [
  { name: 'BKK1, Boeng Keng Kang', lat: 11.5512, lng: 104.9256 },
  { name: 'Tuol Kouk, St 289', lat: 11.5789, lng: 104.8964 },
  { name: 'Sen Sok, Russian Blvd', lat: 11.564, lng: 104.881 },
  { name: 'Por Senchey, St 2004', lat: 11.545, lng: 104.862 },
  { name: 'Chaktomuk, Daun Penh', lat: 11.558, lng: 104.931 },
  { name: 'Chbar Ampov, National Rd 1', lat: 11.531, lng: 104.945 },
];

export function LocationInputGroup({
  pickup,
  dropoff,
  savedLocations,
  onChangePickup,
  onChangeDropoff,
}: LocationInputGroupProps) {
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropoffMenu, setShowDropoffMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPickupMenu(false);
        setShowDropoffMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={ref} className="flex-1 flex flex-col sm:flex-row items-stretch">
      {/* Pick-up Location */}
      <div className="relative flex-1 p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group">
        <label className="block text-[11px] font-semibold text-slate-400 tracking-tight uppercase leading-none mb-1.5">
          Pick-up location
        </label>
        <div
          onClick={() => {
            setShowPickupMenu((prev) => !prev);
            setShowDropoffMenu(false);
          }}
          className="flex items-center justify-between gap-1"
        >
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-900 block truncate group-hover:text-brand-700 transition-colors">
              {pickup.name}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {pickup.address.split(',')[0]}
            </span>
          </div>
          <MapPin className="h-4 w-4 text-brand-600 flex-shrink-0" />
        </div>

        {showPickupMenu && (
          <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Saved Warehouses
            </span>
            <div className="space-y-1">
              {savedLocations.map((loc) => (
                <button
                  key={loc.id || loc.name}
                  type="button"
                  onClick={() => {
                    onChangePickup(loc);
                    setShowPickupMenu(false);
                  }}
                  className={cn(
                    'w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5',
                    loc.name === pickup.name
                      ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{loc.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{loc.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center Arrow Indicator */}
      <div className="hidden sm:flex items-center justify-center px-1 text-slate-400">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Drop-off Location */}
      <div className="relative flex-1 p-3.5 hover:bg-slate-50/80 transition-colors border-t sm:border-t-0 sm:border-l border-slate-100">
        <label className="block text-[11px] font-semibold text-slate-400 tracking-tight uppercase leading-none mb-1.5">
          Drop-off location
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dropoff.address}
            onChange={(e) => onChangeDropoff({ ...dropoff, address: e.target.value })}
            onFocus={() => {
              setShowDropoffMenu(true);
              setShowPickupMenu(false);
            }}
            placeholder="Airport, city, station, street..."
            className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent truncate"
          />
          <Navigation className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        </div>
        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
          {dropoff.landmark ? `Landmark: ${dropoff.landmark}` : 'Customer destination'}
        </span>

        {showDropoffMenu && (
          <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Quick Select Districts
            </span>
            <div className="space-y-1">
              {POPULAR_ZONES.map((zone) => (
                <button
                  key={zone.name}
                  type="button"
                  onClick={() => {
                    onChangeDropoff({
                      ...dropoff,
                      address: zone.name,
                      coordinates: { lat: zone.lat, lng: zone.lng },
                    });
                    setShowDropoffMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition"
                >
                  <span className="font-medium text-slate-800">{zone.name}</span>
                  <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-semibold">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

