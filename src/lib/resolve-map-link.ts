import { GeoCoordinates } from '@/features/booking/types/booking-types';

export interface ResolvedMapLocationResult {
  coordinates: GeoCoordinates;
  placeName?: string;
  address: string;
  resolvedUrl: string;
}

/**
 * Calls the internal BFF `/api/locations/resolve` route to expand short Google Maps
 * share links (such as `maps.app.goo.gl/...`) into coordinates and a display address.
 */
export async function resolveGoogleMapsLink(
  input: string,
  signal?: AbortSignal,
): Promise<ResolvedMapLocationResult> {
  const res = await fetch('/api/locations/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
    signal,
    cache: 'no-store',
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      'Could not extract coordinates from this Google Maps link.';
    throw new Error(message);
  }

  return data as ResolvedMapLocationResult;
}

