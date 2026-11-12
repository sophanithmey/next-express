import React from 'react';
import { notFound } from 'next/navigation';
import { bookingServerService } from '@/server/services/booking-server-service';
import { getServerEnv } from '@/server/lib/env';
import { sessionService } from '@/server/lib/session';
import { BookingDetailView } from '@/features/booking/components/booking-detail-view';

interface BookingDetailPageProps {
  params: Promise<{ 'booking-id': string }>;
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const env = getServerEnv();
  const session = await sessionService.getSession();
  const resolvedParams = await params;
  const bookingId = resolvedParams['booking-id'];

  if (!env.mockOrderApi && !session?.accessToken) {
    return <BookingDetailView order={null} bookingId={bookingId} />;
  }

  const order = await bookingServerService
    .getBookingById(bookingId, { session })
    .catch(() => null);

  if (!order) {
    if (process.env.NEXT_PUBLIC_LOCAL_DEMO_STORAGE === 'true') {
      return <BookingDetailView order={null} bookingId={bookingId} />;
    }
    notFound();
  }

  return <BookingDetailView order={order} bookingId={bookingId} />;
}
