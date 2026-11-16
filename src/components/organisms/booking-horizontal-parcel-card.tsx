'use client';

import React, { useState } from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { Package, ChevronDown, ChevronUp, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface BookingHorizontalParcelCardProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
}

const QUICK_CATEGORIES = [
  { id: 'apparel', labelKey: 'catApparel', emoji: '👗' },
  { id: 'cosmetics', labelKey: 'catCosmetics', emoji: '💄' },
  { id: 'electronics', labelKey: 'catElectronics', emoji: '📱' },
  { id: 'food', labelKey: 'catFood', emoji: '🍜' },
  { id: 'documents', labelKey: 'catDocuments', emoji: '📄' },
  { id: 'general', labelKey: 'catGeneral', emoji: '📦' },
] as const;

export function BookingHorizontalParcelCard({
  parcel,
  onChangeParcel,
}: BookingHorizontalParcelCardProps) {
  const tParcel = useTranslations('Parcel');
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const [isExpanded, setIsExpanded] = useState(false);

  const description = parcel.description || '';
  const hasDescription = Boolean(description.trim());
  const fragileText = tParcel('fragileBadge');
  const isFragile = description.includes(fragileText);

  const handleSelectCategory = (catLabel: string) => {
    if (description.startsWith(catLabel)) {
      const rest = description
        .replace(catLabel, '')
        .replace(/^[•\s,]+/, '')
        .trim();
      onChangeParcel({ ...parcel, description: rest });
      return;
    }

    const cleanFragile = isFragile ? ` • ${fragileText}` : '';
    onChangeParcel({ ...parcel, description: `${catLabel}${cleanFragile}` });
  };

  const handleToggleFragile = () => {
    if (isFragile) {
      const next = description
        .replace(` • ${fragileText}`, '')
        .replace(fragileText, '')
        .trim();
      onChangeParcel({ ...parcel, description: next });
    } else {
      const next = description ? `${description} • ${fragileText}` : fragileText;
      onChangeParcel({ ...parcel, description: next });
    }
  };

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
              {hasDescription ? description : tParcel('noDescription')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-amber-800 hover:text-amber-900 hidden sm:inline">
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
        <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/30 space-y-3.5 animate-in fade-in duration-200">
          {/* Quick Categories */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {tParcel('quickCategories')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CATEGORIES.map((cat) => {
                const label = tParcel(cat.labelKey);
                const isSelected = description.includes(label);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(label)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer active:scale-95',
                      isSelected
                        ? 'bg-primary-50 text-slate-950 border-primary-400 font-bold shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="horizontal-parcel-desc" optional>
                {tParcel('description')}
              </Label>
              {hasDescription && (
                <button
                  type="button"
                  onClick={() => onChangeParcel({ ...parcel, description: '' })}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>{tCommon('clear')}</span>
                </button>
              )}
            </div>
            <Input
              id="horizontal-parcel-desc"
              placeholder={tParcel('descriptionPlaceholder')}
              value={description}
              onChange={(e) =>
                onChangeParcel({ ...parcel, description: e.target.value })
              }
              leftIcon={<Package className="h-4 w-4 text-slate-400" />}
              sizeVariant="md"
            />
          </div>

          {/* Fragile Tag */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleToggleFragile}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95',
                isFragile
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-3.5 w-3.5',
                  isFragile ? 'text-amber-600' : 'text-slate-400'
                )}
              />
              <span>{fragileText}</span>
            </button>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {tParcel('subtitle')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
