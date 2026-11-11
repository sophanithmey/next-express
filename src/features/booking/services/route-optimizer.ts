import { DropoffStop, GeoCoordinates } from '../types/booking-types';
import {
  calculateHaversineDistanceKm,
  calculateTotalRouteDistanceKm,
} from './pricing-service';

export interface RouteOptimizationResult {
  optimizedStops: DropoffStop[];
  beforeKm: number;
  afterKm: number;
  savedKm: number;
  changed: boolean;
}

/**
 * Orders multi-drop stops using a nearest-neighbor sequence starting from pickup coordinates.
 */
export function optimizeStopOrder(
  pickupCoords: GeoCoordinates,
  stops: DropoffStop[]
): RouteOptimizationResult {
  if (stops.length <= 1) {
    const singleKm = calculateTotalRouteDistanceKm(
      pickupCoords,
      stops.map((s) => s.dropoff.coordinates)
    );
    return {
      optimizedStops: stops,
      beforeKm: singleKm,
      afterKm: singleKm,
      savedKm: 0,
      changed: false,
    };
  }

  const beforeKm = calculateTotalRouteDistanceKm(
    pickupCoords,
    stops.map((s) => s.dropoff.coordinates)
  );

  const remaining = stops.map((stop, index) => ({ stop, index }));
  const ordered: DropoffStop[] = [];
  let cursor = pickupCoords;

  while (remaining.length > 0) {
    let bestPos = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidateCoords = remaining[i].stop.dropoff.coordinates;
      const dist = calculateHaversineDistanceKm(cursor, candidateCoords);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestPos = i;
      }
    }

    const [chosen] = remaining.splice(bestPos, 1);
    ordered.push(chosen.stop);
    cursor = chosen.stop.dropoff.coordinates;
  }

  const afterKm = calculateTotalRouteDistanceKm(
    pickupCoords,
    ordered.map((s) => s.dropoff.coordinates)
  );

  const orderChanged = ordered.some((stop, idx) => stop.id !== stops[idx]?.id);
  const improved = afterKm <= beforeKm && orderChanged;
  const finalStops = improved ? ordered : stops;
  const finalAfterKm = improved ? afterKm : beforeKm;
  const savedKm = Math.max(0, Math.round((beforeKm - finalAfterKm) * 10) / 10);

  return {
    optimizedStops: finalStops,
    beforeKm,
    afterKm: finalAfterKm,
    savedKm,
    changed: improved,
  };
}

