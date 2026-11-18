'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Bookmark,
  Layers,
  Package,
  RotateCcw,
} from 'lucide-react';
import {
  BookingLayoutSwitcher,
  BookingLayoutMode,
} from '@/components/molecules/booking-layout-switcher';

export type BookingWorkspaceMode = 'single' | 'bulk';

interface BookingPageHeaderProps {
  workspaceMode: BookingWorkspaceMode;
  onWorkspaceModeChange: (mode: BookingWorkspaceMode) => void;
  layoutMode: BookingLayoutMode;
  onLayoutChange: (mode: BookingLayoutMode) => void;
  isAuthenticated: boolean;
  sellerName: string;
  savedDraftsCount: number;
  onOpenDrafts: () => void;
  onResetForm: () => void;
}

/**
 * Top workspace header for the booking page with Single vs Bulk Upload Order switch,
 * saved drafts, layout switch, form reset trigger, and authenticated seller bookings link.
 */
export function BookingPageHeader({
  workspaceMode,
  onWorkspaceModeChange,
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
    <div className="space-y-4 border-b border-slate-200/80 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {workspaceMode === 'bulk'
              ? tBooking('bulkOrderModalTitle')
              : layoutMode === 'horizontal'
              ? tBooking('pageTitle')
              : isAuthenticated
              ? tBooking('welcomeSeller', { name: sellerName })
              : tBooking('pageTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {workspaceMode === 'bulk'
              ? tBooking('bulkOrderModalSubtitle')
              : layoutMode === 'horizontal'
              ? tBooking('pageSubtitle')
              : isAuthenticated
              ? tBooking('authenticatedSubtitle')
              : tBooking('pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {workspaceMode === 'single' && isAuthenticated && savedDraftsCount > 0 && (
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

          {workspaceMode === 'single' && (
            <BookingLayoutSwitcher mode={layoutMode} onChange={onLayoutChange} />
          )}

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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-950 hover:text-slate-950 bg-primary-50 hover:bg-primary-100 border border-primary-300 px-3 py-1.5 rounded-xl transition"
            >
              <span>{tNav('myBookings')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mode Switcher: Single Order vs Bulk Upload Orders */}
      <div
        role="tablist"
        aria-label={tBooking('workspaceModeAria')}
        className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={workspaceMode === 'single'}
          onClick={() => onWorkspaceModeChange('single')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
            workspaceMode === 'single'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="h-3.5 w-3.5 text-brand-600" />
          <span>{tBooking('modeSingleOrder')}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={workspaceMode === 'bulk'}
          onClick={() => onWorkspaceModeChange('bulk')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
            workspaceMode === 'bulk'
              ? 'bg-primary-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{tBooking('modeBulkOrder')}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
              workspaceMode === 'bulk'
                ? 'bg-slate-950/10 text-slate-950'
                : 'bg-primary-100 text-primary-950 border border-primary-300'
            }`}
          >
            {tBooking('bulkOrderBadge')}
          </span>
        </button>
      </div>
    </div>
  );
}
