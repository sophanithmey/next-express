'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { User, Phone, Edit3, HomeIcon } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/phone-number';
import { useTranslations } from 'next-intl';

interface PickupCompactCardProps {
  pickup: PickupLocation;
  onChangeClick: () => void;
}

export function PickupCompactCard({ pickup, onChangeClick }: PickupCompactCardProps) {
  const tPickup = useTranslations('Pickup');

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary-50 border border-secondary-200 shadow-2xs">
            <HomeIcon className="h-4 w-4 text-secondary-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {tPickup('savedHubLabel')}
            </span>
            <p className="text-xs font-black text-slate-900 truncate">
              {pickup.name || tPickup('defaultWarehouseName')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeClick}
          className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50 transition cursor-pointer shadow-2xs shrink-0"
        >
          <Edit3 className="h-3 w-3" />
          <span>{tPickup('changeButton')}</span>
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-snug line-clamp-2">
        {pickup.address}
      </p>

      {(pickup.senderName || pickup.senderPhone) && (
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
          {pickup.senderName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3 text-slate-400" />
              <span>{pickup.senderName}</span>
            </span>
          )}
          {pickup.senderPhone && (
            <span className="flex items-center gap-1 font-mono font-medium">
              <Phone className="h-3 w-3 text-slate-400" />
              <span>{formatPhoneNumber(pickup.senderPhone)}</span>
            </span>
          )}
        </div>
      )}

      {pickup.riderNote && (
        <p className="text-[10px] text-slate-500 italic bg-white/70 p-1.5 rounded-md border border-slate-100">
          {tPickup('notePrefix')} {pickup.riderNote}
        </p>
      )}
    </div>
  );
}

