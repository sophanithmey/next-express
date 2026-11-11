import {
  BookingFeeQuote,
  DeliverySpeedOption,
  GeoCoordinates,
} from '../types/booking-types';

export const ADDITIONAL_STOP_FEE = 0.75;

export const SPEED_BASE_FEES: Record<DeliverySpeedOption, number> = {
  instant: 1.75,
  same_day: 1.25,
  scheduled: 1.0,
};

/**
 * Computes great-circle distance between two coordinates in kilometers (minimum 0.5 km).
 */
export function calculateHaversineDistanceKm(
  c1: GeoCoordinates,
  c2: GeoCoordinates
): number {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.5, Math.round(R * c * 10) / 10);
}

/**
 * Computes cumulative multi-leg route distance from pickup across all stops in sequence.
 */
export function calculateTotalRouteDistanceKm(
  pickup: GeoCoordinates,
  stopCoords: GeoCoordinates[]
): number {
  if (stopCoords.length === 0) return 0;

  let total = 0;
  let prev = pickup;
  for (const next of stopCoords) {
    total += calculateHaversineDistanceKm(prev, next);
    prev = next;
  }
  return Math.round(total * 10) / 10;
}

/**
 * Shared client and server fee calculator accounting for distance, delivery speed, and extra stops.
 */
export function calculateBookingFeeQuote({
  pickupCoords,
  dropoffCoords,
  additionalStopsCount = 0,
  deliverySpeed = 'instant',
}: {
  pickupCoords?: GeoCoordinates;
  dropoffCoords?: GeoCoordinates;
  additionalStopsCount?: number;
  deliverySpeed?: DeliverySpeedOption;
}): BookingFeeQuote {
  const baseFee = SPEED_BASE_FEES[deliverySpeed] ?? SPEED_BASE_FEES.instant;
  const extraStopsCharge = Math.max(0, additionalStopsCount) * ADDITIONAL_STOP_FEE;

  if (!pickupCoords || !dropoffCoords) {
    return {
      baseFee,
      distanceKm: 3.5,
      totalDeliveryFee: Math.round((baseFee + extraStopsCharge) * 100) / 100,
      deliverySpeed,
    };
  }

  const distanceKm = Math.max(
    1,
    calculateHaversineDistanceKm(pickupCoords, dropoffCoords)
  );
  const distanceCharge = Math.max(0, distanceKm - 2) * 0.25;
  const totalDeliveryFee =
    Math.round((baseFee + distanceCharge + extraStopsCharge) * 100) / 100;

  return {
    baseFee,
    distanceKm,
    totalDeliveryFee,
    deliverySpeed,
  };
}

/**
 * Derives display prices for all delivery speed options from the active estimated fee.
 */
export function getSpeedOptionFees(
  currentFee: number,
  selectedOption: DeliverySpeedOption = 'instant'
): { instantFee: number; sameDayFee: number; scheduledFee: number } {
  const activeBase = SPEED_BASE_FEES[selectedOption] ?? SPEED_BASE_FEES.instant;
  const variableFee = Math.max(0, currentFee - activeBase);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    instantFee: round2(SPEED_BASE_FEES.instant + variableFee),
    sameDayFee: round2(SPEED_BASE_FEES.same_day + variableFee),
    scheduledFee: round2(SPEED_BASE_FEES.scheduled + variableFee),
  };
}

