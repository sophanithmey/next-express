import { APP_CONFIG } from '@/lib/constants';

interface BuildTrackingShareInput {
  tracking: string;
  locale: string;
  origin?: string;
  recipient: string;
  dropoff: string;
  codAmount: number;
}

export interface TrackingSharePayload {
  trackingPath: string;
  fullTrackingUrl: string;
  buyerMessage: string;
  telegramShareUrl: string;
}

/**
 * Builds canonical live tracking URLs and buyer-ready share messages.
 */
export function buildTrackingSharePayload({
  tracking,
  locale,
  origin = '',
  recipient,
  dropoff,
  codAmount,
}: BuildTrackingShareInput): TrackingSharePayload {
  const trackingPath = `/track/${tracking}`;
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

