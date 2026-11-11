import { BookingOrder, TimelineEvent } from '../types/booking-types';

/**
 * Formats ISO timestamps into readable local date/time strings while preserving preformatted labels.
 */
export function formatOrderTimestamp(raw: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const datePart = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} • ${timePart}`;
}

/**
 * Generates milestone timeline events when an order has no explicit timeline array.
 */
export function buildDefaultTimeline(order: BookingOrder): TimelineEvent[] {
  const isPaid = order.paymentStatus === 'paid';
  const isPickedUp = ['out_for_delivery', 'delivered'].includes(order.status);
  const isDelivered = order.status === 'delivered';

  return [
    {
      status: 'created',
      title: 'Created',
      timestamp: formatOrderTimestamp(order.createdAt),
      description: 'Delivery requested by seller',
      completed: true,
    },
    {
      status: 'paid',
      title: 'Paid',
      timestamp: isPaid ? 'Confirmed' : 'Pending',
      description: isPaid
        ? 'Checkout payment settled'
        : 'Awaiting payment confirmation',
      completed: isPaid,
      current: order.status === 'pending' && !isPaid,
    },
    {
      status: 'assigned',
      title: 'Courier Assigned',
      timestamp: order.deliverer ? 'Assigned' : 'Pending',
      description: order.deliverer
        ? `Assigned to ${order.deliverer.name}`
        : 'Matching nearest rider',
      completed:
        Boolean(order.deliverer) ||
        ['assigned', 'out_for_delivery', 'delivered'].includes(order.status),
      current: order.status === 'assigned',
    },
    {
      status: 'picked_up',
      title: 'Picked Up',
      timestamp: isPickedUp ? 'Completed' : 'Pending',
      description: 'Parcel collected from pickup warehouse',
      completed: isPickedUp,
    },
    {
      status: 'out_for_delivery',
      title: 'In Transit',
      timestamp:
        order.status === 'out_for_delivery'
          ? 'Active'
          : isDelivered
          ? 'Completed'
          : 'Pending',
      description: 'Courier en route to buyer destination',
      completed: isPickedUp,
      current: order.status === 'out_for_delivery',
    },
    {
      status: 'delivered',
      title: 'Delivered',
      timestamp: isDelivered ? 'Completed' : 'Pending',
      description: 'Delivered to recipient',
      completed: isDelivered,
      current: isDelivered,
    },
  ];
}

