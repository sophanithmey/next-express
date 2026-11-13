import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { GeocodingServiceError, getGoogleMapsOrThrow } from './geocoding-service';

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
}

export interface ResolvedPlaceResult {
  address: string;
  name: string;
  coordinates: GeoCoordinates;
  placeId: string;
}

/**
 * Queries Google Places Autocomplete biased around Cambodia / current map center.
 */
export async function searchPlacesAutocomplete(
  query: string,
  center: GeoCoordinates = APP_CONFIG.defaultCoordinates,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const maps = await getGoogleMapsOrThrow();
  const AutocompleteService = maps.places?.AutocompleteService;
  if (!AutocompleteService) {
    throw new GeocodingServiceError('MAPS_UNAVAILABLE', 'Google Places is unavailable.');
  }

  return new Promise<PlaceSuggestion[]>((resolve, reject) => {
    const service = new AutocompleteService();
    service.getPlacePredictions(
      {
        input: trimmed,
        componentRestrictions: { country: 'kh' },
        locationBias: {
          center: { lat: center.lat, lng: center.lng },
          radius: 30000,
        },
      },
      (predictions, status) => {
        if (status === 'OK' && predictions) {
          resolve(
            predictions.map((item) => ({
              placeId: item.place_id,
              primaryText: item.structured_formatting?.main_text || item.description,
              secondaryText: item.structured_formatting?.secondary_text || '',
              description: item.description,
            })),
          );
          return;
        }
        if (status === 'ZERO_RESULTS' || !predictions) {
          resolve([]);
          return;
        }
        reject(new GeocodingServiceError('REQUEST_FAILED', `Places search failed: ${status}`));
      },
    );
  });
}

/**
 * Resolves exact coordinates and formatted address for a selected Google Place ID.
 */
export async function getPlaceDetailsById(placeId: string): Promise<ResolvedPlaceResult> {
  if (!placeId.trim()) {
    throw new GeocodingServiceError('ZERO_RESULTS', 'Missing place ID.');
  }

  const maps = await getGoogleMapsOrThrow();
  const PlacesService = maps.places?.PlacesService;
  if (!PlacesService || typeof document === 'undefined') {
    throw new GeocodingServiceError('MAPS_UNAVAILABLE', 'Places Details service is unavailable.');
  }

  return new Promise<ResolvedPlaceResult>((resolve, reject) => {
    const container = document.createElement('div');
    const service = new PlacesService(container);
    service.getDetails(
      { placeId, fields: ['place_id', 'name', 'formatted_address', 'geometry'] },
      (result, status) => {
        const location = result?.geometry?.location;
        if (status !== 'OK' || !result || !location) {
          reject(
            new GeocodingServiceError(
              status === 'ZERO_RESULTS' ? 'ZERO_RESULTS' : 'REQUEST_FAILED',
              'Unable to load place details.',
            ),
          );
          return;
        }
        const lat = Number(location.lat().toFixed(6));
        const lng = Number(location.lng().toFixed(6));
        const address = result.formatted_address || result.name || '';
        const name = result.name || address.split(',')[0] || 'Pinned Location';
        resolve({ placeId: result.place_id || placeId, name, address, coordinates: { lat, lng } });
      },
    );
  });
}

