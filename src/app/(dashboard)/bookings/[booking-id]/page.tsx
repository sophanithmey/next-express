import React from 'react';
import { notFound } from 'next/navigation';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { BookingDetailView } from '@/features/booking/components/booking-detail-view';

interface BookingDetailPageProps {
  params: Promise<{ 'booking-id': string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const session = await sessionService.getSession();
  const resolvedParams = await params;
  const bookingId = resolvedParams['booking-id'];

  const order = await expressApiClient.getBookingById(
    bookingId,
    session?.accessToken
  );

  if (!order) {
    notFound();
  }

  return <BookingDetailView order={order} />;
}

