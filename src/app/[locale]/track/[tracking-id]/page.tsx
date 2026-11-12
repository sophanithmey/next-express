import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { bookingServerService } from '@/server/services/booking-server-service';
import { LiveTrackingView } from '@/features/booking/components/live-tracking-view';
import { scopeOrderToStop } from '@/features/booking/services/tracking-share-helper';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { buildPageSeoMetadata } from '@/lib/seo';

interface LiveTrackingPageProps {
  params: Promise<{ locale: string; 'tracking-id': string }>;
  searchParams: Promise<{ stop?: string }>;
}

export async function generateMetadata({ params }: LiveTrackingPageProps) {
  const { locale, 'tracking-id': rawTrackingId } = await params;
  const tracking = decodeURIComponent(rawTrackingId || '').trim().toUpperCase();
  const t = await getTranslations({ locale, namespace: 'LiveTracking' });

  return buildPageSeoMetadata({
    title: t('metaTitle', { tracking: tracking || 'WingExpress' }),
    description: t('metaDescription'),
  });
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

export default async function LiveTrackingPage({
  params,
  searchParams,
}: LiveTrackingPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const trackingId = decodeURIComponent(resolvedParams['tracking-id'] || '').trim();
  const scopedStopId = resolvedSearchParams?.stop?.trim() || undefined;

  if (!trackingId) {
    notFound();
  }

  const order = await bookingServerService.getTrackingOrder(trackingId);

  if (order) {
    const scopedOrder = scopeOrderToStop(order, scopedStopId);
    return (
      <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
        <main className="flex-1">
          <LiveTrackingView order={scopedOrder} scopedStopId={scopedStopId} />
        </main>
      </div>
    );
  }

  // Graceful fallback for freshly generated demo links across serverless resets or browser-local storage
  if (
    /^EXP-[A-Z0-9]{4,}$/i.test(trackingId) ||
    process.env.NEXT_PUBLIC_LOCAL_DEMO_STORAGE === 'true'
  ) {
    const scopedDemo = scopeOrderToStop(buildDemoTrackingFallback(trackingId), scopedStopId);
    return (
      <div className="flex-1 flex flex-col bg-slate-50/60 antialiased font-sans">
        <main className="flex-1">
          <LiveTrackingView order={scopedDemo} scopedStopId={scopedStopId} />
        </main>
      </div>
    );
  }

  notFound();
}

