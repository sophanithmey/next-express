import React from 'react';
import { PublicHeader } from '@/components/organisms/public-header';
import { BookingPageClient } from '@/features/booking/components/booking-page-client';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';

export const metadata = {
  title: 'Express Seller — Simple Delivery Booking',
  description: 'Book your delivery in seconds. Fast logistics for online merchants and sellers in Cambodia.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 antialiased">
      {/* Compact Header */}
      <PublicHeader />

      {/* Main Two-Column Booking Experience */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Create Express Booking
            </h1>
            <p className="text-xs text-slate-500">
              Instant dispatch for online shops and live sellers. No sign in required until review.
            </p>
          </div>

          <BookingPageClient initialLocations={SAMPLE_PHNOM_PENH_LOCATIONS} />
        </div>
      </main>
    </div>
  );
}
