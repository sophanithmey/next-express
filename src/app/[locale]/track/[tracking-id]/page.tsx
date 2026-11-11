import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { expressApiClient } from '@/server/api/express-api-client';
import { LiveTrackingView } from '@/features/booking/components/live-tracking-view';
import { BookingOrder } from '@/features/booking/types/booking-types';

interface LiveTrackingPageProps {
  params: Promise<{ locale: string; 'tracking-id': string }>;
}

export async function generateMetadata({ params }: LiveTrackingPageProps) {
  const { locale, 'tracking-id': rawTrackingId } = await params;
  const tracking = decodeURIComponent(rawTrackingId || '').trim().toUpperCase();
  const t = await getTranslations({ locale, namespace: 'LiveTracking' });

  return {
    title: t('metaTitle', { tracking: tracking || 'WingExpress' }),
    description: t('metaDescription'),
  };
}

function buildDemoTrackingFallback(trackingId: string): BookingOrder {
  const now = new Date().toISOString();
  return {
    id: `demo-${trackingId}`,
    trackingNumber: trackingId.toUpperCase(),
    trackingUrl: `https://tracking.express.wingbank.com/${trackingId.toUpperCase()}`,
    status: 'out_for_delivery',
    pickup: {
      name: 'Central Warehouse (Main)',
      address: 'St 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh',
      coordinates: { lat: 11.5321, lng: 104.9123 },
    },
    dropoff: {
      address: 'St 310, Sangkat Boeng Keng Kang I, Khan Boeng Keng Kang, Phnom Penh',
      coordinates: { lat: 11.5512, lng: 104.9256 },
    },
    recipient: {
      name: 'Customer Recipient',
      phoneNumber: '012 998 877',
    },
    parcel: {
      sellerOrderRef: trackingId.toUpperCase(),
      description: 'Express Delivery Parcel',
    },
    cod: {
      isCod: false,
      amount: 0,
    },
    deliveryFee: 1.75,
    totalSellerCharge: 1.75,
    deliveryOption: 'instant',
    createdAt: now,
    updatedAt: now,
  };
}

export default async function LiveTrackingPage({ params }: LiveTrackingPageProps) {
  const resolvedParams = await params;
  const trackingId = decodeURIComponent(resolvedParams['tracking-id'] || '').trim();

  if (!trackingId) {
    notFound();
  }

  const order = await expressApiClient.getBookingById(trackingId);

  if (order) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
        <main className="flex-1">
          <LiveTrackingView order={order} />
        </main>
      </div>
    );
  }

  // Graceful fallback for freshly generated demo EXP-* links across serverless resets
  if (/^EXP-[A-Z0-9]{4,}$/i.test(trackingId)) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
        <main className="flex-1">
          <LiveTrackingView order={buildDemoTrackingFallback(trackingId)} />
        </main>
      </div>
    );
  }

  notFound();
}

