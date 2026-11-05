'use client';

import React, { useState } from 'react';
import { PickupLocation, GeoCoordinates } from '@/features/booking/types/booking-types';
import { AddressCard } from '../molecules/address-card';
import { LocationSearch } from '../molecules/location-search';
import { Button } from '../atoms/button';
import { FormField } from '../molecules/form-field';
import { Input } from '../atoms/input';
import { Plus, Warehouse, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(
  () => import('./delivery-map').then((mod) => mod.DeliveryMap),
  { ssr: false }
);

interface LocationPickerProps {
  savedLocations: PickupLocation[];
  selectedLocation: PickupLocation;
  onSelectLocation: (loc: PickupLocation) => void;
  onSaveNewLocation?: (loc: PickupLocation) => Promise<void>;
}

export function LocationPicker({
  savedLocations,
  selectedLocation,
  onSelectLocation,
  onSaveNewLocation,
}: LocationPickerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCoords, setNewCoords] = useState<GeoCoordinates>({ lat: 11.5564, lng: 104.9282 });
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderPhone, setNewSenderPhone] = useState('');

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setNewCoords(coords);
          setNewAddress(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        },
        () => {
          alert('Unable to retrieve current GPS location. Please enter address manually.');
        }
      );
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;

    const loc: PickupLocation = {
      name: newName,
      address: newAddress,
      coordinates: newCoords,
      senderName: newSenderName || undefined,
      senderPhone: newSenderPhone || undefined,
    };

    if (onSaveNewLocation) {
      await onSaveNewLocation(loc);
    }
    onSelectLocation(loc);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Select Pickup Location</h3>
          <p className="text-xs text-slate-500">
            Choose where our express driver will collect your parcels
          </p>
        </div>
        <Button
          type="button"
          variant={isAddingNew ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setIsAddingNew(!isAddingNew)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          {isAddingNew ? 'Use Saved Location' : 'Add New Location'}
        </Button>
      </div>

      {!isAddingNew ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedLocations.map((loc, idx) => (
              <AddressCard
                key={loc.id || idx}
                location={loc}
                isSelected={selectedLocation.address === loc.address}
                onSelect={() => onSelectLocation(loc)}
              />
            ))}
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Pickup Preview on Map
            </span>
            <DeliveryMap
              pickupCoords={selectedLocation.coordinates}
              isDraggableDropoff={false}
              className="h-56 w-full"
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveLocation} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Warehouse className="h-4 w-4 text-brand-600" />
              <span>New Pickup Location Details</span>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Use Current Location</span>
            </button>
          </div>

          <FormField label="Location / Branch Name" required>
            <Input
              placeholder="e.g., Central Warehouse or Boutique Branch #2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Search or Enter Address" required>
            <LocationSearch
              placeholder="Type street, district or sangkat..."
              onSelectLocation={(addr, coords) => {
                setNewAddress(addr);
                setNewCoords(coords);
              }}
            />
            {newAddress && (
              <p className="mt-1 text-xs text-slate-600 font-medium bg-slate-50 p-2 rounded border border-slate-200">
                Selected: {newAddress}
              </p>
            )}
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Sender Contact Name">
              <Input
                placeholder="Store manager name"
                value={newSenderName}
                onChange={(e) => setNewSenderName(e.target.value)}
              />
            </FormField>
            <FormField label="Sender Phone Number">
              <Input
                placeholder="012 345 678"
                value={newSenderPhone}
                onChange={(e) => setNewSenderPhone(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Location
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

