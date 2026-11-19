'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface ParcelCollapsedPreviewProps {
  hasDescription: boolean;
  description: string;
  onExpand: () => void;
}

export function ParcelCollapsedPreview({
  hasDescription,
  description,
  onExpand,
}: ParcelCollapsedPreviewProps) {
  const tParcel = useTranslations('Parcel');
  const tCommon = useTranslations('Common');

  return (
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
              : 'text-slate-400 italic',
          )}
        >
          {hasDescription ? description : tParcel('noDescription')}
        </span>
      </div>
      <button
        type="button"
        onClick={onExpand}
        className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer shrink-0"
      >
        {hasDescription ? tCommon('edit') : `+ ${tParcel('addDetails')}`}
      </button>
    </div>
  );
}
