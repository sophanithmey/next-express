import React from 'react';
import { bookingServerService } from '@/server/services/booking-server-service';
import { sessionService } from '@/server/lib/session';
import { BookingHistoryManager } from '@/features/booking/components/booking-history-manager';
import { buildPageSeoMetadata } from '@/lib/seo';

export const metadata = buildPageSeoMetadata({
  title: 'Delivery Operations & Bookings — WingExpress',
  description: 'Manage live courier dispatches, track orders, and view COD collections.',
});

export default async function BookingsPage() {
  const session = await sessionService.getSession();
  const data = await bookingServerService.getBookingsPageData(session);

  return (
    <BookingHistoryManager
      initialOrders={data.orders}
      initialTotal={data.total}
      initialTotalPages={data.totalPages}
      stats={data.stats}
      sellerName={session?.user.shopName || session?.user.name}
    />
  );
}
