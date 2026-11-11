'use client';

import React, { useState } from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Package, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface ParcelCodSectionProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
  defaultExpanded?: boolean;
}

export function ParcelCodSection({
  parcel,
  onChangeParcel,
  defaultExpanded = false,
}: ParcelCodSectionProps) {
  const tParcel = useTranslations('Parcel');
  const tCommon = useTranslations('Common');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasCustomData =
    Boolean(parcel.sellerOrderRef?.trim()) || Boolean(parcel.description?.trim());

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all">
      {/* Header: Title, Optional Tag, and Collapse Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-emerald-950 tracking-tight">
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
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer select-none py-1 px-2 rounded-lg hover:bg-brand-50/60 transition"
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
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-slate-700 shrink-0">
              {tParcel('refPrefix')}{' '}
              <span className="font-mono">
                {parcel.sellerOrderRef || tCommon('optional')}
              </span>
            </span>
            {parcel.description && (
              <>
                <span>•</span>
                <span className="truncate text-slate-600">{parcel.description}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-xs font-semibold text-brand-600 hover:underline cursor-pointer shrink-0"
          >
            {hasCustomData ? tCommon('edit') : tCommon('details')}
          </button>
        </div>
      )}

      {/* Expanded Parcel Controls */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            <Label htmlFor="parcel-ref" optional>
              {tParcel('orderRef')}
            </Label>
            <Input
              id="parcel-ref"
              placeholder={tParcel('orderRefPlaceholder')}
              value={parcel.sellerOrderRef || ''}
              onChange={(e) =>
                onChangeParcel({ ...parcel, sellerOrderRef: e.target.value })
              }
              leftIcon={<Package className="h-4 w-4 text-slate-400" />}
              className="font-mono"
              sizeVariant="md"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="parcel-desc" optional>
              {tParcel('description')}
            </Label>
            <Input
              id="parcel-desc"
              placeholder={tParcel('descriptionPlaceholder')}
              value={parcel.description || ''}
              onChange={(e) =>
                onChangeParcel({ ...parcel, description: e.target.value })
              }
              sizeVariant="md"
            />
          </div>
        </div>
      )}
    </section>
  );
}
