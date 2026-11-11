'use client';

import React, { useState } from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BookingHorizontalParcelCardProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
}

export function BookingHorizontalParcelCard({
  parcel,
  onChangeParcel,
}: BookingHorizontalParcelCardProps) {
  const tParcel = useTranslations('Parcel');
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition">
      {/* Header / Click to Expand */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50/70 transition cursor-pointer text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {tParcel('title')}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {tParcel('refPrefix')}{' '}
              <span className="font-semibold text-slate-700 font-mono">
                {parcel.sellerOrderRef || tCommon('optional')}
              </span>
              {parcel.description ? ` • ${parcel.description}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-brand-600 hidden sm:inline">
            {isExpanded ? tBooking('collapse') : tBooking('configure')}
          </span>
          <span className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </div>
      </button>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/30 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label htmlFor="horizontal-order-ref" optional>
                {tParcel('orderRef')}
              </Label>
              <Input
                id="horizontal-order-ref"
                placeholder={tParcel('orderRefPlaceholder')}
                value={parcel.sellerOrderRef || ''}
                onChange={(e) =>
                  onChangeParcel({ ...parcel, sellerOrderRef: e.target.value })
                }
                sizeVariant="md"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="horizontal-parcel-desc" optional>
                {tParcel('description')}
              </Label>
              <Input
                id="horizontal-parcel-desc"
                placeholder={tParcel('descriptionPlaceholder')}
                value={parcel.description || ''}
                onChange={(e) =>
                  onChangeParcel({ ...parcel, description: e.target.value })
                }
                sizeVariant="md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
