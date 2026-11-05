import React from 'react';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { BookingHistoryManager } from '@/features/booking/components/booking-history-manager';

export default async function BookingsPage() {
  const session = await sessionService.getSession();
  const bookings = await expressApiClient.getBookings(
    { page: 1, limit: 10 },
    session?.accessToken
  );

  return (
    <BookingHistoryManager
      initialOrders={bookings.items}
      initialTotal={bookings.pagination.total}
      initialTotalPages={bookings.pagination.totalPages}
    />
  );
}
