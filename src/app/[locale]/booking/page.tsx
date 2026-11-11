import React from 'react';
import { getTranslations } from 'next-intl/server';
import { BookingPageClient } from '@/features/booking/components/booking-page-client';
import { SAMPLE_PHNOM_PENH_LOCATIONS } from '@/features/booking/data/mock-booking-data';

interface BookingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Booking' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function BookingPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <BookingPageClient initialLocations={SAMPLE_PHNOM_PENH_LOCATIONS} />
        </div>
      </main>
    </div>
  );
}
