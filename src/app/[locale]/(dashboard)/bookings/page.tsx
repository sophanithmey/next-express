import React from 'react';
import { expressApiClient } from '@/server/api/express-api-client';
import { consumerOrderClient } from '@/server/api/consumer-order-client';
import { computeDashboardStatistics } from '@/server/api/consumer-order-mapper';
import { getServerEnv } from '@/server/config/server-env';
import { sessionService } from '@/server/auth/session-service';
import { BookingHistoryManager } from '@/features/booking/components/booking-history-manager';

export const metadata = {
  title: 'Delivery Operations & Bookings — WingExpress',
  description: 'Manage live courier dispatches, track orders, and view COD collections.',
};

export default async function BookingsPage() {
  const env = getServerEnv();
  const session = await sessionService.getSession();

  if (!env.mockOrderApi) {
    const emptyStats = computeDashboardStatistics([]);
    if (!session?.accessToken) {
      return (
        <BookingHistoryManager
          initialOrders={[]}
          initialTotal={0}
          initialTotalPages={1}
          stats={emptyStats}
        />
      );
    }

    const bookings = await consumerOrderClient
      .listOrders({ accessToken: session.accessToken, page: 1, rpp: 10 })
      .catch(() => ({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      }));

    return (
      <BookingHistoryManager
        initialOrders={bookings.items}
        initialTotal={bookings.pagination.total}
        initialTotalPages={bookings.pagination.totalPages}
        stats={computeDashboardStatistics(bookings.items)}
        sellerName={session.user.shopName || session.user.name}
      />
    );
  }

  const [stats, bookings] = await Promise.all([
    expressApiClient.getDashboardStatistics(),
    expressApiClient.getBookings({ page: 1, limit: 10 }, session?.accessToken),
  ]);

  return (
    <BookingHistoryManager
      initialOrders={bookings.items}
      initialTotal={bookings.pagination.total}
      initialTotalPages={bookings.pagination.totalPages}
      stats={stats}
      sellerName={session?.user.shopName || session?.user.name}
    />
  );
}
