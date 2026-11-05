import React from 'react';
import { PublicHeader } from '@/components/organisms/public-header';
import { BookingPageClient } from '@/features/booking/components/booking-page-client';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';

export const metadata = {
  title: 'Book Express Delivery — Fast Merchant Shipping',
  description: 'Book, manage, and dispatch daily customer parcels with instant COD tracking.',
};

export default async function HomePage() {
  const user = await sessionService.getCurrentUser().catch(() => null);
  const locations = await expressApiClient.getSavedLocations().catch(() => []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Book Express Delivery</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {user
                  ? `Logged in as ${user.shopName || user.name}. Fast dispatch for your daily orders.`
                  : 'Instant dispatch for online shops and live sellers. No sign in required until review.'}
              </p>
            </div>
            {user && locations[0] && (
              <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs self-start sm:self-auto">
                <span className="text-slate-400">Default Warehouse: </span>
                <span className="font-semibold text-slate-800">{locations[0].name}</span>
              </div>
            )}
          </div>
          <BookingPageClient initialLocations={locations} />
        </div>
      </main>
    </div>
  );
}
