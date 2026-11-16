import { GeoCoordinates } from '@/features/booking/types/booking-types';

/**
 * Geographic perimeter boundary coordinates enclosing Phnom Penh Capital region.
 * Covers all 14 urban and suburban Khans (Doun Penh, Chamkar Mon, Prampir Meakkakra,
 * Tuol Kouk, Dangkao, Mean Chey, Russey Keo, Saensokh, Por Senchey, Chroy Changvar,
 * Prek Pnov, Chbar Ampov, Boeng Keng Kang, and Kamboul).
 */
export const PHNOM_PENH_BOUNDARY: ReadonlyArray<GeoCoordinates> = [
  { lat: 11.705, lng: 104.855 }, // Prek Pnov North / Win-Win Blvd
  { lat: 11.685, lng: 104.900 }, // Prek Pnov East / Tonle Sap bank
  { lat: 11.650, lng: 104.945 }, // Chroy Changvar upper peninsula
  { lat: 11.620, lng: 104.965 }, // Chroy Changvar tip / Mekong East
  { lat: 11.575, lng: 104.955 }, // Mekong crossing / Arey Ksat ferry line
  { lat: 11.535, lng: 105.015 }, // Chbar Ampov (Nirouth / Prek Eng)
  { lat: 11.505, lng: 105.040 }, // Kbal Koh (National Road 1 boundary)
  { lat: 11.465, lng: 105.025 }, // Prek Thmei / Bassac River bend
  { lat: 11.450, lng: 104.955 }, // Southern Bassac / Ta Khmau border
  { lat: 11.430, lng: 104.905 }, // Southern Dangkor / Hun Sen Blvd south
  { lat: 11.425, lng: 104.860 }, // Choeung Ek / Ring Road 3 south
  { lat: 11.445, lng: 104.815 }, // Prateah Lang / Prey Veng
  { lat: 11.470, lng: 104.760 }, // Western Ring Road 3 / Kamboul south
  { lat: 11.515, lng: 104.720 }, // Phnom Penh SEZ / National Road 4 west
  { lat: 11.565, lng: 104.725 }, // Western Por Senchey / Trapeang Krasang
  { lat: 11.605, lng: 104.755 }, // Samraong / Krang Thnong
  { lat: 11.655, lng: 104.795 }, // Western Prek Pnov
  { lat: 11.695, lng: 104.825 }, // Northern Prek Pnov border
] as const;

/**
 * Strict bounding box for rapid pre-filtering.
 */
export const PHNOM_PENH_BOUNDS = {
  north: 11.73,
  south: 11.41,
  west: 104.70,
  east: 105.06,
} as const;

/**
 * Relaxed viewport navigation restriction bounds for Google Map camera.
 */
export const PHNOM_PENH_RESTRICTION_BOUNDS = {
  north: 11.85,
  south: 11.30,
  west: 104.55,
  east: 105.20,
} as const;

/**
 * Default fallback center (Wat Phnom / Central Phnom Penh).
 */
export const DEFAULT_PHNOM_PENH_COORDINATES: GeoCoordinates = {
  lat: 11.5564,
  lng: 104.9282,
};

/**
 * Visual styling options for the Phnom Penh service area polygon overlay.
 * Uses Wing Gold/Yellow with semi-transparent fill to highlight the valid pin region.
 */
export const PHNOM_PENH_POLYGON_STYLE = {
  strokeColor: '#D9A700',
  strokeOpacity: 0.9,
  strokeWeight: 2.5,
  fillColor: '#FFCC00',
  fillOpacity: 0.16,
  clickable: false,
  zIndex: 1,
} as const;

/**
 * Determines whether a given coordinate point lies inside the official
 * Phnom Penh Capital delivery service perimeter using ray-casting point-in-polygon.
 */
export function isInsidePhnomPenh(coords: GeoCoordinates | null | undefined): boolean {
  if (!coords) return false;
  const { lat, lng } = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  // Rapid bounding box pre-check
  if (
    lat < PHNOM_PENH_BOUNDS.south ||
    lat > PHNOM_PENH_BOUNDS.north ||
    lng < PHNOM_PENH_BOUNDS.west ||
    lng > PHNOM_PENH_BOUNDS.east
  ) {
    return false;
  }

  // Ray-casting point-in-polygon algorithm
  let inside = false;
  const poly = PHNOM_PENH_BOUNDARY;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].lng;
    const yi = poly[i].lat;
    const xj = poly[j].lng;
    const yj = poly[j].lat;

    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Clamps coordinates to Phnom Penh: returns original if inside, or default center if outside.
 */
export function clampToPhnomPenh(coords: GeoCoordinates): GeoCoordinates {
  return isInsidePhnomPenh(coords) ? coords : DEFAULT_PHNOM_PENH_COORDINATES;
}
