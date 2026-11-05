import React from 'react';
import { PublicHeader } from '@/components/organisms/public-header';
import { BookingPageClient } from '@/features/booking/components/booking-page-client';
import { expressApiClient } from '@/server/api/express-api-client';

export const metadata = {
  title: 'Book a Delivery — WingExpress',
  description:
    'Fast, easy delivery booking for online sellers. Book your next parcel in under 2 minutes.',
};

export default async function HomePage() {
  const locations = await expressApiClient.getSavedLocations().catch(() => []);

  return (
    <div className='min-h-screen flex flex-col bg-slate-50'>
      <PublicHeader />
      <main className='flex-1 py-6 px-4 sm:px-6'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-6'>
            <h1 className='text-xl font-bold text-slate-900'>
              Book a Delivery
            </h1>
            <p className='text-xs text-slate-500 mt-1'>
              Fill in your parcel details — no account needed until you confirm.
            </p>
          </div>
          <BookingPageClient initialLocations={locations} />
        </div>
      </main>
    </div>
  );
}
