'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export const QUICK_CATEGORIES = [
  { id: 'apparel', labelKey: 'catApparel', emoji: '👗' },
  { id: 'cosmetics', labelKey: 'catCosmetics', emoji: '💄' },
  { id: 'electronics', labelKey: 'catElectronics', emoji: '📱' },
  { id: 'food', labelKey: 'catFood', emoji: '🍜' },
  { id: 'documents', labelKey: 'catDocuments', emoji: '📄' },
  { id: 'general', labelKey: 'catGeneral', emoji: '📦' },
] as const;

interface ParcelCategoryChipsProps {
  description: string;
  onSelectCategory: (catLabel: string) => void;
}

export function ParcelCategoryChips({
  description,
  onSelectCategory,
}: ParcelCategoryChipsProps) {
  const tParcel = useTranslations('Parcel');

  return (
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
              onClick={() => onSelectCategory(label)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer active:scale-95',
                isSelected
                  ? 'bg-primary-50 text-slate-950 border-primary-400 font-bold shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80',
              )}
            >
              <span>{cat.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
