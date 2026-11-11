'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, Bookmark, RotateCcw } from 'lucide-react';
import {
  BookingLayoutSwitcher,
  BookingLayoutMode,
} from '@/components/molecules/booking-layout-switcher';

interface BookingPageHeaderProps {
  layoutMode: BookingLayoutMode;
  onLayoutChange: (mode: BookingLayoutMode) => void;
  isAuthenticated: boolean;
  sellerName: string;
  savedDraftsCount: number;
  onOpenDrafts: () => void;
  onResetForm: () => void;
}

/**
 * Top workspace header for the booking page with saved drafts, layout switch,
 * form reset trigger, and authenticated seller bookings link.
 */
export function BookingPageHeader({
  layoutMode,
  onLayoutChange,
  isAuthenticated,
  sellerName,
  savedDraftsCount,
  onOpenDrafts,
  onResetForm,
}: BookingPageHeaderProps) {
  const tBooking = useTranslations('Booking');
  const tNav = useTranslations('Navigation');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {layoutMode === 'horizontal'
            ? tBooking('pageTitle')
            : isAuthenticated
            ? tBooking('welcomeSeller', { name: sellerName })
            : tBooking('pageTitle')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {layoutMode === 'horizontal'
            ? tBooking('pageSubtitle')
            : isAuthenticated
            ? tBooking('authenticatedSubtitle')
            : tBooking('pageSubtitle')}
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        {isAuthenticated && savedDraftsCount > 0 && (
          <button
            type="button"
            onClick={onOpenDrafts}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            title={tBooking('viewSavedDrafts')}
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-600" />
            <span>
              {tBooking('savedDrafts')} ({savedDraftsCount})
            </span>
          </button>
        )}

        <BookingLayoutSwitcher mode={layoutMode} onChange={onLayoutChange} />

        <button
          type="button"
          onClick={onResetForm}
          title={tBooking('resetFormTitle')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{tBooking('resetForm')}</span>
        </button>

        {isAuthenticated && (
          <Link
            href="/bookings"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-700 hover:text-secondary-800 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 px-3 py-1.5 rounded-xl transition"
          >
            <span>{tNav('myBookings')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

