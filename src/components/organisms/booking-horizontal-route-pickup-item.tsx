'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { CheckCircle2, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingHorizontalRoutePickupItemProps {
  pickup: PickupLocation;
  isValid: boolean;
  onOpenModal: () => void;
}

export function BookingHorizontalRoutePickupItem({
  pickup,
  isValid,
  onOpenModal,
}: BookingHorizontalRoutePickupItemProps) {
  const tPickup = useTranslations('Pickup');
  const tCommon = useTranslations('Common');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenModal}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal();
        }
      }}
      className="group relative flex items-start gap-3.5 p-3.5 -mx-2 rounded-xl transition hover:bg-slate-50/80 cursor-pointer border border-transparent hover:border-slate-200/60"
    >
      {/* Circular A Indicator */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
        <span>A</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {tPickup('origin')}
          </span>
          {isValid && (
            <span className="inline-flex items-center text-emerald-600 text-xs">
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </div>

        <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
          {pickup.name || (isValid ? pickup.address.split(',')[0] : tPickup('selectLocationPrompt'))}
        </p>

        <p className="text-xs text-slate-500 truncate mt-0.5">
          {pickup.address || tPickup('clickToSelectAddress')}
        </p>

        {pickup.senderPhone && (
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {pickup.senderPhone}
            {pickup.senderName ? ` • ${pickup.senderName}` : ''}
          </p>
        )}
      </div>

      {/* Edit Trigger */}
      <div className="shrink-0 pt-1 text-slate-400 group-hover:text-brand-600 transition">
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className="hidden sm:inline">{tCommon('edit')}</span>
          <Pencil className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

