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
    <div className="sticky bottom-4 z-30 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Fee and COD breakdown */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Delivery Fee
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {stopsCount} {stopsCount > 1 ? 'Stops' : 'Stop'}
            </span>
            {isCod && codAmount > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Banknote className="h-3 w-3 text-emerald-600" />
                <span>COD: {APP_CONFIG.currencySymbol}{codAmount.toFixed(2)}</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {APP_CONFIG.currencySymbol}
              {fee.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              USD • Pay upon dispatch
            </span>
          </div>

          <div className="flex sm:hidden items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>No upfront card charge • Select payment on next step</span>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onClick}
            isLoading={isSubmitting}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
          >
            Review &amp; Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
