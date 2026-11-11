'use client';

import React from 'react';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { formatPhoneNumber } from '@/lib/phone-number';
import { useTranslations } from 'next-intl';
import {
  GripVertical,
  CheckCircle2,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface BookingHorizontalRouteDropoffItemProps {
  stop: DropoffStop;
  index: number;
  totalStops: number;
  routeLabel: string;
  isValid: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isRemovable: boolean;
}

export function BookingHorizontalRouteDropoffItem({
  stop,
  index,
  totalStops,
  routeLabel,
  isValid,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  isRemovable,
}: BookingHorizontalRouteDropoffItemProps) {
  const tRecipient = useTranslations('Recipient');
  const tCommon = useTranslations('Common');
  const tBooking = useTranslations('Booking');
  const isFirst = index === 0;
  const isLast = index === totalStops - 1;

  return (
    <div
      data-id={stop.id}
      className="group relative flex items-center gap-2 sm:gap-3 p-3 rounded-xl bg-white hover:bg-slate-50/80 transition border border-slate-200/80 hover:border-slate-300 shadow-2xs select-none"
    >
      {/* 1. Dedicated Drag Handle */}
      <div
        className="drag-handle touch-none shrink-0 flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-grab active:cursor-grabbing transition"
        title={tBooking('dragToReorder')}
        aria-label={tBooking('dragToReorder')}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 2. Circular Route Indicator (B, C, D, etc.) */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
        <span>{routeLabel}</span>
      </div>

      {/* 3. Recipient & Drop-off Details (Clicking opens Edit modal) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
          }
        }}
        className="flex-1 min-w-0 cursor-pointer pr-1"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {tRecipient('stopLabel', { letter: routeLabel })}
          </span>
          {stop.recipient?.name && (
            <span className="text-xs font-bold text-slate-900 truncate">
              {stop.recipient.name}
            </span>
          )}
          {typeof stop.codAmount === 'number' && stop.codAmount > 0 && (
            <span className="rounded border border-primary-200 bg-primary-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary-900">
              {tRecipient('stopCodTag', { amount: `$${stop.codAmount.toFixed(2)}` })}
            </span>
          )}
          {isValid && (
            <span className="inline-flex items-center text-emerald-600 text-xs">
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
          {stop.dropoff?.address
            ? stop.dropoff.address.split(',')[0]
            : tRecipient('clickToEnterAddress')}
        </p>

        <p className="text-[11px] text-slate-500 truncate mt-0.5">
          {stop.dropoff?.address || tRecipient('setDestinationAddress')}
        </p>

        {stop.recipient?.phoneNumber && (
          <p className="text-[11px] font-mono text-slate-600 mt-0.5">
            {formatPhoneNumber(stop.recipient.phoneNumber)}
          </p>
        )}
      </div>

      {/* 4. Action Buttons (Filtered from drag events via .no-drag) */}
      <div className="no-drag shrink-0 flex items-center gap-1 text-slate-400">
        {/* Accessible Move Up / Down (visible when multiple stops) */}
        {totalStops > 1 && (
          <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer"
              title={tRecipient('moveUp')}
              aria-label={tRecipient('moveUp')}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer"
              title={tRecipient('moveDown')}
              aria-label={tRecipient('moveDown')}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Edit Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
          title={tCommon('edit')}
        >
          <span className="hidden sm:inline">{tCommon('edit')}</span>
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* Remove Button (only when multiple stops exist) */}
        {isRemovable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title={tCommon('remove')}
            aria-label={tCommon('remove')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
