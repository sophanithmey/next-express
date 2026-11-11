'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { ArrowRight, Sparkles, Zap, Package } from 'lucide-react';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';

export function LandingFooterCtaBanner() {
  const { isAuthenticated, openAuthModal } = useAuthState();
  const router = useRouter();

  const handleTrackOrders = () => {
    if (isAuthenticated) {
      router.push('/bookings');
    } else {
      openAuthModal(() => {
        router.push('/bookings');
      });
    }
  };
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-8 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] backdrop-blur-2xl ring-1 ring-black/5">
      {/* Subtle Background Glow Accent (Tailwind compliant, no deprecated classes) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-secondary-100/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 border border-secondary-200/60 px-3 py-1 text-[11px] font-bold text-secondary-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-primary-500" />
            <span>Fast Express Dispatch Across Phnom Penh</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Ready to deliver your online orders faster?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Book multi-stop deliveries in under 60 seconds. Instant courier assignments,
            transparent rates from $1.25, and zero-surcharge COD remittance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/booking"
            prefetch={true}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-secondary-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-secondary-700 hover:shadow-lg active:scale-95 transition-all group"
          >
            <Zap className="h-4 w-4 text-primary-400 group-hover:scale-110 transition-transform" />
            <span>Book a Delivery Now</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={handleTrackOrders}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 hover:bg-white px-5 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-md hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Package className="h-4 w-4 text-slate-600" />
            <span>Track Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
}

