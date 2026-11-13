import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  GoogleMapsLoadError,
  GoogleMapsNamespace,
  loadGoogleMapsApi,
} from '@/lib/google-maps/google-maps-loader';

export type GeocodingErrorCode =
  | 'INVALID_COORDINATES'
  | 'ZERO_RESULTS'
  | 'MAPS_UNAVAILABLE'
  | 'REQUEST_FAILED';

export class GeocodingServiceError extends Error {
  readonly code: GeocodingErrorCode;

  constructor(code: GeocodingErrorCode, message: string) {
    super(message);
    this.name = 'GeocodingServiceError';
    this.code = code;
  }
}

export interface ReverseGeocodeResult {
  address: string;
  placeId?: string;
}

const MAX_CACHE_ENTRIES = 60;
const reverseGeocodeCache = new Map<string, ReverseGeocodeResult>();

export function isValidGeoCoordinates(coords: GeoCoordinates): boolean {
  return (
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180 &&
    !(coords.lat === 0 && coords.lng === 0)
  );
}

export async function getGoogleMapsOrThrow(): Promise<GoogleMapsNamespace> {
  try {
    return await loadGoogleMapsApi();
  } catch (error) {
    if (error instanceof GoogleMapsLoadError) {
      throw new GeocodingServiceError('MAPS_UNAVAILABLE', error.message);
    }
    throw new GeocodingServiceError(
      'MAPS_UNAVAILABLE',
      'Google Maps could not be initialized.',
    );
  }
}

function getCacheKey(coords: GeoCoordinates): string {
  return `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}`;
}

function saveCacheEntry(key: string, value: ReverseGeocodeResult): void {
  if (reverseGeocodeCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = reverseGeocodeCache.keys().next().value;
    if (firstKey) reverseGeocodeCache.delete(firstKey);
  }
  reverseGeocodeCache.set(key, value);
}

/**
 * Resolves numeric coordinates into a readable street address using Google Geocoder.
 */
export async function reverseGeocodeCoordinates(
  coords: GeoCoordinates,
): Promise<ReverseGeocodeResult> {
  if (!isValidGeoCoordinates(coords)) {
    throw new GeocodingServiceError('INVALID_COORDINATES', 'Coordinates are invalid.');
  }

  const cacheKey = getCacheKey(coords);
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached) return cached;

  const maps = await getGoogleMapsOrThrow();
  if (!maps.Geocoder) {
    throw new GeocodingServiceError('MAPS_UNAVAILABLE', 'Google Maps Geocoder is unavailable.');
  }

  return new Promise<ReverseGeocodeResult>((resolve, reject) => {
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ location: { lat: coords.lat, lng: coords.lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]?.formatted_address) {
        const resolved: ReverseGeocodeResult = {
          address: results[0].formatted_address,
          placeId: results[0].place_id,
        };
        saveCacheEntry(cacheKey, resolved);
        resolve(resolved);
        return;
      }
      if (status === 'ZERO_RESULTS' || !results?.length) {
        reject(new GeocodingServiceError('ZERO_RESULTS', 'Unable to find address.'));
        return;
      }
      reject(new GeocodingServiceError('REQUEST_FAILED', `Geocoding failed: ${status}`));
    });
  });
}

export function clearGeocodingCacheForTests(): void {
  reverseGeocodeCache.clear();
}

export {
  searchPlacesAutocomplete,
  getPlaceDetailsById,
  type PlaceSuggestion,
  type ResolvedPlaceResult,
} from './places-service';
