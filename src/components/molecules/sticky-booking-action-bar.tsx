'use client';

import React from 'react';
import { ArrowRight, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '../atoms/button';
import { APP_CONFIG } from '@/lib/constants';

interface StickyBookingActionBarProps {
  fee: number;
  stopsCount: number;
  codAmount?: number;
  isCod: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
}

export function StickyBookingActionBar({
  fee,
  stopsCount,
  codAmount = 0,
  isCod,
  isSubmitting = false,
  onClick,
}: StickyBookingActionBarProps) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 -mb-6 mt-6 px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] rounded-b-2xl transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Summary breakdown */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Delivery Fee
              </span>
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                {stopsCount} {stopsCount > 1 ? 'Stops' : 'Stop'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {APP_CONFIG.currencySymbol}
                {fee.toFixed(2)}
              </span>

              {isCod && codAmount > 0 && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  <Banknote className="h-3 w-3 text-emerald-600" />
                  <span>COD: {APP_CONFIG.currencySymbol}{codAmount.toFixed(2)}</span>
                </span>
              )}
            </div>
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>No upfront card charge • Select payment on next step</span>
            </span>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onClick}
            isLoading={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
          >
            Review &amp; Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
