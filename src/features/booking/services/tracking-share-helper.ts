import { APP_CONFIG } from '@/lib/constants';
import { BookingOrder, DropoffStop } from '../types/booking-types';

interface BuildTrackingShareInput {
  tracking: string;
  locale: string;
  origin?: string;
  recipient: string;
  dropoff: string;
  codAmount: number;
  stopId?: string;
}

export interface TrackingSharePayload {
  trackingPath: string;
  fullTrackingUrl: string;
  buyerMessage: string;
  telegramShareUrl: string;
}

/**
 * Builds canonical live tracking URLs and buyer-ready share messages.
 * When `stopId` is provided, scopes the tracking link strictly to that customer's stop.
 */
export function buildTrackingSharePayload({
  tracking,
  locale,
  origin = '',
  recipient,
  dropoff,
  codAmount,
  stopId,
}: BuildTrackingShareInput): TrackingSharePayload {
  const basePath = `/track/${tracking}`;
  const trackingPath = stopId
    ? `${basePath}?stop=${encodeURIComponent(stopId)}`
    : basePath;
  const fullTrackingUrl = origin
    ? `${origin}/${locale}${trackingPath}`
    : `/${locale}${trackingPath}`;

  const buyerMessage = [
    `📦 WingExpress Delivery Confirmed!`,
    `Tracking No: ${tracking}`,
    `Recipient: ${recipient}`,
    `Destination: ${dropoff}`,
    ...(codAmount > 0
      ? [`COD Due on Arrival: ${APP_CONFIG.currencySymbol}${codAmount.toFixed(2)}`]
      : []),
    `Track live here: ${fullTrackingUrl}`,
  ].join('\n');

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    fullTrackingUrl
  )}&text=${encodeURIComponent(
    `📦 WingExpress Order ${tracking} for ${recipient}${
      codAmount > 0 ? ` (COD $${codAmount.toFixed(2)})` : ''
    }`
  )}`;

  return {
    trackingPath,
    fullTrackingUrl,
    buyerMessage,
    telegramShareUrl,
  };
}

/**
 * Filters a multi-drop BookingOrder down to a single customer stop so buyers
 * only see Pickup -> their own Drop-off, recipient details, and stop COD.
 */
export function scopeOrderToStop(
  order: BookingOrder,
  stopId?: string
): BookingOrder {
  const cleanStopId = stopId?.trim();
  if (!cleanStopId) return order;

  const stops = order.dropoffs;
  if (!stops || stops.length === 0) return order;

  let matched: DropoffStop | undefined = stops.find((s) => s.id === cleanStopId);
  if (!matched) {
    const indexMatch = cleanStopId.match(/^stop-(\d+)$/i);
    if (indexMatch) {
      const idx = Number(indexMatch[1]) - 1;
      if (idx >= 0 && idx < stops.length) {
        matched = stops[idx];
      }
    }
  }

  if (!matched) {
    matched = stops[0];
  }

  const stopCod =
    typeof matched.codAmount === 'number'
      ? Math.max(0, matched.codAmount)
      : stops.length === 1
      ? order.cod?.amount || 0
      : 0;

  return {
    ...order,
    dropoff: matched.dropoff,
    recipient: matched.recipient,
    dropoffs: [matched],
    cod: {
      isCod: stopCod > 0,
      amount: stopCod,
    },
  };
}

