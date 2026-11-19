'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud } from 'lucide-react';

interface DropoffDragDropOverlayProps {
  isDragOver: boolean;
}

export function DropoffDragDropOverlay({ isDragOver }: DropoffDragDropOverlayProps) {
  const tBooking = useTranslations('Booking');

  if (!isDragOver) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/95 backdrop-blur-2xs p-6 text-center animate-in fade-in">
      <UploadCloud className="h-10 w-10 text-emerald-600 animate-bounce mb-2" />
      <p className="text-sm font-extrabold text-slate-900">
        {tBooking('dropoffDragDropHint')}
      </p>
      <p className="text-xs text-slate-600 mt-1">.xlsx, .xls, .csv</p>
    </div>
  );
}
