import React from 'react';
import { notFound } from 'next/navigation';
import { expressApiClient } from '@/server/api/express-api-client';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import { getServerEnv } from '@/server/config/server-env';
import { sessionService } from '@/server/auth/session-service';
import { BookingDetailView } from '@/features/booking/components/booking-detail-view';

interface BookingDetailPageProps {
  params: Promise<{ 'booking-id': string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const env = getServerEnv();
  const session = await sessionService.getSession();
  const resolvedParams = await params;
  const bookingId = resolvedParams['booking-id'];

  if (!env.mockOrderApi) {
    if (!session?.accessToken) {
      return <BookingDetailView order={null} bookingId={bookingId} />;
    }

    const order = await consumerOrderClient
      .getOrder({ accessToken: session.accessToken, orderId: bookingId })
      .catch(() => null);

    if (!order) {
      notFound();
    }

    return <BookingDetailView order={order} bookingId={bookingId} />;
  }

  const order = await expressApiClient.getBookingById(bookingId, session?.accessToken);

  if (!order) {
    notFound();
  }

  return <BookingDetailView order={order} bookingId={bookingId} />;
}
