'use client';

import React, { useMemo } from 'react';
import {
  PickupLocation,
  DropoffLocation,
  DropoffStop,
  RecipientInfo,
  CodInfo,
} from '@/features/booking/types/booking-types';
import { BookingHorizontalRouteHeader } from './booking-horizontal-route-header';
import { BookingHorizontalRoutePickupItem } from './booking-horizontal-route-pickup-item';
import { BookingHorizontalRouteDropoffItem } from './booking-horizontal-route-dropoff-item';
import { BookingHorizontalRouteFooter } from './booking-horizontal-route-footer';
import { isDropoffStopDirty } from '@/features/booking/services/booking-form-helpers';
import { useSortableList } from '@/hooks/use-sortable-list';
import { Plus, GripVertical, Route } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingHorizontalRoutePreviewProps {
  pickup: PickupLocation;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  recipient: RecipientInfo;
  fee: number;
  cod: CodInfo;
  onOpenPickupModal: () => void;
  onOpenDropoffModal: (index?: number) => void;
  onReorderDropoffs?: (stops: DropoffStop[]) => void;
  onRemoveDropoff?: (index: number) => void;
  onAddDropoff?: () => void;
  onOptimizeRoute?: () => void;
}

export function BookingHorizontalRoutePreview({
  pickup,
  dropoff,
  dropoffs = [],
  recipient,
  fee,
  cod,
  onOpenPickupModal,
  onOpenDropoffModal,
  onReorderDropoffs,
  onRemoveDropoff,
  onAddDropoff,
  onOptimizeRoute,
}: BookingHorizontalRoutePreviewProps) {
  const tBooking = useTranslations('Booking');
  // Normalize drop-offs into canonical stops array
  const stops: DropoffStop[] = useMemo(() => {
    if (dropoffs && dropoffs.length > 0) {
      return dropoffs;
    }
    return [
      {
        id: 'stop-1',
        recipient,
        dropoff,
      },
    ];
  }, [dropoffs, recipient, dropoff]);

  const isStopValid = (s: DropoffStop) =>
    Boolean(s.dropoff?.address && s.dropoff.address.trim().length >= 3) &&
    Boolean(s.recipient?.phoneNumber && s.recipient.phoneNumber.replace(/\D/g, '').length >= 8);

  const isPickupValid = Boolean(pickup.address && pickup.address.trim().length >= 3);
  const isReady = isPickupValid && stops.every(isStopValid);

  const handleReorder = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    const reordered = [...stops];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorderDropoffs?.(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) handleReorder(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < stops.length - 1) handleReorder(index, index + 1);
  };

  const handleRemove = (index: number) => {
    if (stops.length <= 1) return;
    const target = stops[index];
    if (isDropoffStopDirty(target) && typeof window !== 'undefined') {
      const letter = String.fromCharCode(66 + index);
      const ok = window.confirm(
        `Remove stop ${letter} (${target.recipient?.name || target.dropoff?.address || 'Destination'})?`
      );
      if (!ok) return;
    }
    if (onRemoveDropoff) {
      onRemoveDropoff(index);
    } else {
      const remaining = stops.filter((_, idx) => idx !== index);
      onReorderDropoffs?.(remaining);
    }
  };

  const sortableContainerRef = useSortableList(stops.length, handleReorder, {
    disabled: stops.length <= 1,
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition">
      {/* Route Preview Header */}
      <BookingHorizontalRouteHeader isReady={isReady} />

      {/* Route Content: Point A & Point B (or B, C, D...) */}
      <div className="p-5 sm:p-6 space-y-2">
        {/* Point A: Pickup Row (Fixed, non-draggable) */}
        <BookingHorizontalRoutePickupItem
          pickup={pickup}
          isValid={isPickupValid}
          onOpenModal={onOpenPickupModal}
        />

        {/* Route Connector Line */}
        <div className="ml-7 pl-[3px] py-0.5">
          <div className="h-4 w-0 border-l-2 border-dotted border-slate-300" />
        </div>

        {/* Drop-off destinations header helper + route optimizer */}
        {stops.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">
              {tBooking('stopsHeaderLabel', { count: stops.length })}
            </span>
            <div className="flex items-center gap-2.5">
              {onOptimizeRoute && (
                <button
                  type="button"
                  onClick={onOptimizeRoute}
                  title={tBooking('optimizeRouteTitle')}
                  className="inline-flex items-center gap-1 rounded-lg border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-[11px] font-bold text-secondary-700 hover:bg-secondary-100 transition cursor-pointer"
                >
                  <Route className="h-3 w-3 text-secondary-600" />
                  <span>{tBooking('optimizeRoute')}</span>
                </button>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 font-medium">
                <GripVertical className="h-3 w-3" />
                <span>{tBooking('dragToReorder')}</span>
              </span>
            </div>
          </div>
        )}

        {/* Draggable Drop-off Destinations Container */}
        <div ref={sortableContainerRef} className="space-y-2.5">
          {stops.map((stop, index) => {
            const letter = String.fromCharCode(66 + index);
            return (
              <BookingHorizontalRouteDropoffItem
                key={stop.id || `stop-${index}`}
                stop={stop}
                index={index}
                totalStops={stops.length}
                routeLabel={letter}
                isValid={isStopValid(stop)}
                onEdit={() => onOpenDropoffModal(index)}
                onRemove={() => handleRemove(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isRemovable={stops.length > 1}
              />
            );
          })}
        </div>

        {/* Add Destination Button */}
        {onAddDropoff && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onAddDropoff}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-brand-700 bg-brand-50/60 hover:bg-brand-50 border border-dashed border-brand-200 rounded-xl transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-brand-600" />
              <span>{tBooking('addDestination')}</span>
            </button>
          </div>
        )}

        {/* Card Footer: Fee & Conditional COD Badge */}
        <BookingHorizontalRouteFooter fee={fee} cod={cod} />
      </div>
    </div>
  );
}
