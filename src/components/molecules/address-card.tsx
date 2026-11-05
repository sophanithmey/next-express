import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { cn } from '@/lib/cn';

interface AddressCardProps {
  location: PickupLocation;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function AddressCard({
  location,
  isSelected,
  onSelect,
  className,
}: AddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all',
        isSelected
          ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-1 ring-brand-600'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{location.name}</h4>
            {location.isDefault && (
              <span className="inline-block rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                Default Pickup
              </span>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>

      <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {location.address}
      </p>

      {location.senderPhone && (
        <p className="mt-2 text-[11px] text-slate-400">
          Sender Contact: {location.senderPhone}
        </p>
      )}
    </div>
  );
}
