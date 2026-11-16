'use client';

import React, { useState } from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Package, ChevronDown, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface ParcelCodSectionProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
  defaultExpanded?: boolean;
}

const QUICK_CATEGORIES = [
  { id: 'apparel', labelKey: 'catApparel', emoji: '👗' },
  { id: 'cosmetics', labelKey: 'catCosmetics', emoji: '💄' },
  { id: 'electronics', labelKey: 'catElectronics', emoji: '📱' },
  { id: 'food', labelKey: 'catFood', emoji: '🍜' },
  { id: 'documents', labelKey: 'catDocuments', emoji: '📄' },
  { id: 'general', labelKey: 'catGeneral', emoji: '📦' },
] as const;

export function ParcelCodSection({
  parcel,
  onChangeParcel,
  defaultExpanded = false,
}: ParcelCodSectionProps) {
  const tParcel = useTranslations('Parcel');
  const tCommon = useTranslations('Common');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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

  const handleClear = () => {
    onChangeParcel({ ...parcel, description: '' });
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all">
      {/* Header: Title, Optional Tag, and Collapse Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {tParcel('title')}
            </h2>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              {tCommon('optional')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer select-none py-1 px-2 rounded-lg hover:bg-amber-50/70 transition"
        >
          <span>{isExpanded ? tCommon('close') : tCommon('details')}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Collapsed Compact Preview */}
      {!isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 shrink-0">
              <Package className="h-3.5 w-3.5" />
            </span>
            <span
              className={cn(
                'truncate',
                hasDescription
                  ? 'font-medium text-slate-800'
                  : 'text-slate-400 italic'
              )}
            >
              {hasDescription ? description : tParcel('noDescription')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer shrink-0"
          >
            {hasDescription ? tCommon('edit') : `+ ${tParcel('addDetails')}`}
          </button>
        </div>
      )}

      {/* Expanded Parcel Controls */}
      {isExpanded && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
          {/* Quick Category Chips */}
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
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Input Field with Clear Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="parcel-desc" optional>
                {tParcel('description')}
              </Label>
              {hasDescription && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>{tCommon('clear')}</span>
                </button>
              )}
            </div>
            <Input
              id="parcel-desc"
              placeholder={tParcel('descriptionPlaceholder')}
              value={description}
              onChange={(e) =>
                onChangeParcel({ ...parcel, description: e.target.value })
              }
              leftIcon={<Package className="h-4 w-4 text-slate-400" />}
              sizeVariant="md"
            />
          </div>

          {/* Quick Handling Attribute (Fragile) */}
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
    </section>
  );
}
