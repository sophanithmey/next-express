export const APP_CONFIG = {
  appName: 'Express Seller',
  currency: 'USD',
  currencySymbol: '$',
  defaultCoordinates: {
    lat: 11.5564,
    lng: 104.9282,
  },
  defaultAddress: 'Phnom Penh, Cambodia',
};

export const SESSION_COOKIE_NAME = 'express_seller_session';

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Pickup',
  confirmed: 'Confirmed',
  assigned: 'Driver Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  assigned: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  out_for_delivery: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};
