'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../atoms/button';
import { SearchInput } from '../molecules/search-input';
import { StatusBadge } from '../molecules/status-badge';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { PlusCircle, Search, ArrowRight, ShieldCheck, MapPin, X } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface HomeHeroProps {
  isAuthenticated: boolean;
}

export function HomeHero({ isAuthenticated }: HomeHeroProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<BookingOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const bookExpressHref = isAuthenticated
    ? '/bookings/new'
    : '/login?redirect=/bookings/new';

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(trackingNumber.trim())}`);
      if (res.ok) {
        const order = await res.json();
        setTrackingResult(order);
      } else {
        setSearchError('Tracking number not found. Please verify the code.');
      }
    } catch {
      setSearchError('Network error checking tracking number.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Merchant Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
          <span>Built for Facebook Live Sellers & Online Merchants</span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
          Deliver Faster. Sell More. <br />
          <span className="text-brand-600">Effortless Express Dispatch.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Book, manage, and dispatch daily deliveries in under 60 seconds. Featuring pinpoint GPS map dropping, real-time COD collection tracking, and 1-click customer notification updates.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={bookExpressHref} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-3.5 shadow-md hover:shadow-lg"
              leftIcon={<PlusCircle className="h-5 w-5" />}
            >
              Book Express
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
          )}
        </div>

        {/* Fast Parcel Tracking Box */}
        <div className="mt-12 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Quick Tracking Lookup
          </span>
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="flex-1">
              <SearchInput
                placeholder="Enter tracking code (e.g. EXP-88239012)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onClear={() => setTrackingNumber('')}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isSearching}
              leftIcon={<Search className="h-4 w-4" />}
            >
              Track
            </Button>
          </form>

          {searchError && (
            <p className="mt-2 text-xs text-rose-500 font-medium">{searchError}</p>
          )}

          {/* Quick Tracking Result Card */}
          {trackingResult && (
            <div className="relative mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <button
                type="button"
                onClick={() => setTrackingResult(null)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {trackingResult.trackingNumber}
                </span>
                <StatusBadge status={trackingResult.status} />
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <p>
                  <strong>Recipient:</strong> {trackingResult.recipient.name} ({trackingResult.recipient.phoneNumber})
                </p>
                <p className="line-clamp-1">
                  <strong>Destination:</strong> {trackingResult.dropoff.address}
                </p>
                {trackingResult.cod.isCod && (
                  <p className="text-emerald-700 font-semibold">
                    COD Amount: {APP_CONFIG.currencySymbol}{trackingResult.cod.amount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verified Wing Bank Network
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-600" />
            Nationwide City Coverage
          </span>
          <span className="flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4 text-purple-600" />
            Zero Setup Fees
          </span>
        </div>
      </div>
    </section>
  );
}
