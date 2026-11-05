import React from 'react';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { BookingLayout } from '@/components/templates/booking-layout';
import { BookingPageClient } from '@/features/booking/components/booking-page-client';

export default async function NewBookingPage() {
  const session = await sessionService.getSession();
  const locations = await expressApiClient.getSavedLocations(session?.accessToken).catch(() => []);

  return (
    <BookingLayout
      title="Create Express Delivery"
      subtitle="One continuous form with live summary. Instant courier dispatch."
    >
      <BookingPageClient initialLocations={locations} />
    </BookingLayout>
  );
}
