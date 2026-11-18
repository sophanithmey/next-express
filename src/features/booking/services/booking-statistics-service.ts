import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import {
  BookingDatePreset,
  CustomDateRange,
  isOrderInDatePreset,
} from './booking-date-filter';

/**
 * Pure helper that derives Total COD and 5-stage pipeline statistics
 * from a list of orders, optionally scoped to a date preset / custom range.
 *
 * Business rule: Cash on Delivery (COD) for cancelled or draft orders is excluded.
 */
export function deriveDashboardStatsFromOrders(
  orders: BookingOrder[],
  options?: {
    datePreset?: BookingDatePreset;
    customRange?: CustomDateRange;
    referenceDate?: Date;
  },
): DashboardStatistics {
  const refDate = options?.referenceDate ?? new Date();
  const scopedOrders =
    options?.datePreset && options.datePreset !== 'all'
      ? orders.filter((order) =>
          isOrderInDatePreset(
            order.createdAt,
            options.datePreset!,
            refDate,
            options.customRange,
          ),
        )
      : orders;

  let todayBookings = 0;
  let pendingPickup = 0;
  let accepted = 0;
  let inTransit = 0;
  let delivered = 0;
  let cancelled = 0;
  let codCollection = 0;

  for (const order of scopedOrders) {
    if (isOrderInDatePreset(order.createdAt, 'today', refDate) && order.status !== 'draft') {
      todayBookings += 1;
    }

    if (
      order.status === 'pending' ||
      order.status === 'draft' ||
      order.status === 'confirmed'
    ) {
      pendingPickup += 1;
    } else if (order.status === 'assigned') {
      accepted += 1;
    } else if (order.status === 'out_for_delivery') {
      inTransit += 1;
    } else if (order.status === 'delivered') {
      delivered += 1;
    } else if (order.status === 'cancelled') {
      cancelled += 1;
    }

    if (order.cod.isCod && order.status !== 'cancelled' && order.status !== 'draft') {
      codCollection += order.cod.amount;
    }
  }

  return {
    todayBookings,
    pendingPickup,
    accepted,
    inTransit,
    delivered,
    cancelled,
    codCollection: Math.round(codCollection * 100) / 100,
  };
}
