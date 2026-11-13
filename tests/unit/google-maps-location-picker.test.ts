import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enMessages from '../../messages/en.json';
import kmMessages from '../../messages/km.json';
import {
  GoogleMapsLoadError,
  GoogleMapsNamespace,
  loadGoogleMapsApi,
  resetGoogleMapsLoaderForTests,
} from '@/lib/google-maps/google-maps-loader';
import {
  createDraggableMarker,
  toNumericCoords,
} from '@/lib/google-maps/google-maps-marker';
import {
  GeocodingServiceError,
  clearGeocodingCacheForTests,
  getPlaceDetailsById,
  reverseGeocodeCoordinates,
  searchPlacesAutocomplete,
} from '@/features/booking/services/geocoding-service';
import {
  applyConfirmedDropoffLocation,
  applyConfirmedPickupLocation,
} from '@/features/booking/services/booking-location-helper';
import { BookingFormData } from '@/features/booking/types/booking-types';

interface MockScriptEl {
  id: string;
  src: string;
  async: boolean;
  defer: boolean;
  onerror: (() => void) | null;
}

describe('Google Maps Location Picker Suite', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const originalAltKey = process.env.NEXT_PUBLIC_MAP_API_KEY;

  beforeEach(() => {
    resetGoogleMapsLoaderForTests();
    clearGeocodingCacheForTests();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    if (originalApiKey === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    else process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalApiKey;
    if (originalAltKey === undefined) delete process.env.NEXT_PUBLIC_MAP_API_KEY;
    else process.env.NEXT_PUBLIC_MAP_API_KEY = originalAltKey;
    vi.restoreAllMocks();
  });

  it('rejects gracefully outside browser and when API key is missing', async () => {
    // @ts-expect-error simulating SSR global absence
    globalThis.window = undefined;
    await expect(loadGoogleMapsApi()).rejects.toMatchObject({
      name: 'GoogleMapsLoadError',
      code: 'SSR_UNAVAILABLE',
    });

    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_MAP_API_KEY;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {} as Document;

    await expect(loadGoogleMapsApi()).rejects.toThrow(GoogleMapsLoadError);
    await expect(loadGoogleMapsApi()).rejects.toMatchObject({
      code: 'MISSING_API_KEY',
    });
  });

  it('loads Google Maps script once (singleton) and recovers if script loading fails', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-browser-key';
    const elements = new Map<string, MockScriptEl>();
    const appendChild = vi.fn((el: MockScriptEl) => {
      elements.set(el.id, el);
      return el;
    });

    const fakeDoc = {
      getElementById: (id: string) => elements.get(id) || null,
      createElement: () => ({ id: '', src: '', async: false, defer: false, onerror: null }),
      head: { appendChild },
    };
    const fakeWin: Record<string, unknown> = {};
    globalThis.document = fakeDoc as unknown as Document;
    globalThis.window = fakeWin as unknown as Window & typeof globalThis;

    // 1. Trigger error on first attempt -> should clear cache for retry
    const firstAttempt = loadGoogleMapsApi();
    expect(appendChild).toHaveBeenCalledTimes(1);
    const firstScript = appendChild.mock.calls[0][0];
    expect(firstScript.src).toContain('key=test-browser-key');
    expect(firstScript.src).toContain('libraries=places%2Cmarker');
    firstScript.onerror?.();
    await expect(firstAttempt).rejects.toMatchObject({ code: 'SCRIPT_LOAD_ERROR' });

    // 2. Retry succeeds and caches promise across concurrent calls
    elements.clear();
    const importLibrary = vi.fn().mockResolvedValue({});
    const mockMaps = {
      Map: vi.fn(),
      importLibrary,
    } as unknown as GoogleMapsNamespace;

    const p1 = loadGoogleMapsApi();
    const p2 = loadGoogleMapsApi();
    expect(appendChild).toHaveBeenCalledTimes(2);

    fakeWin.google = { maps: mockMaps };
    (fakeWin.__wingExpressInitMaps as () => void)();

    const [m1, m2] = await Promise.all([p1, p2]);
    expect(m1).toBe(mockMaps);
    expect(m2).toBe(mockMaps);
    expect(importLibrary).toHaveBeenCalledWith('maps');
    expect(importLibrary).toHaveBeenCalledWith('places');
    expect(importLibrary).toHaveBeenCalledWith('marker');
  });

  it('formats coordinates safely with caching and rejects invalid coordinates', async () => {
    const first = await reverseGeocodeCoordinates({ lat: 11.5512, lng: 104.9256 });
    const cached = await reverseGeocodeCoordinates({ lat: 11.551201, lng: 104.925602 });
    expect(first).toEqual({
      address: '11.55120, 104.92560, Phnom Penh',
    });
    expect(cached).toEqual(first);

    await expect(reverseGeocodeCoordinates({ lat: 0, lng: 0 })).rejects.toMatchObject({
      code: 'INVALID_COORDINATES',
    });
  });

  it('searches Google Places Autocomplete and retrieves numeric coordinates by placeId', async () => {
    const getPlacePredictions = vi.fn((_req, cb) => {
      cb(
        [
          {
            place_id: 'aeon-1',
            description: 'AEON Mall Phnom Penh, Samdech Sothearos Blvd',
            structured_formatting: {
              main_text: 'AEON Mall Phnom Penh',
              secondary_text: 'Samdech Sothearos Blvd',
            },
          },
        ],
        'OK',
      );
    });
    const getDetails = vi.fn((_req, cb) => {
      cb(
        {
          place_id: 'aeon-1',
          name: 'AEON Mall Phnom Penh',
          formatted_address: 'No. 132, Samdech Sothearos Blvd, Phnom Penh',
          geometry: {
            location: { lat: () => 11.5476541, lng: () => 104.9333219 },
          },
        },
        'OK',
      );
    });

    globalThis.document = { createElement: () => ({}) } as unknown as Document;
    globalThis.window = {
      google: {
        maps: {
          Map: vi.fn(),
          Geocoder: vi.fn(),
          places: {
            AutocompleteService: function MockAuto() {
              return { getPlacePredictions };
            },
            PlacesService: function MockPlaces() {
              return { getDetails };
            },
          },
        },
      },
    } as unknown as Window & typeof globalThis;

    expect(await searchPlacesAutocomplete('a')).toEqual([]);
    expect(getPlacePredictions).not.toHaveBeenCalled();

    const suggestions = await searchPlacesAutocomplete('AEON');
    expect(suggestions).toEqual([
      {
        placeId: 'aeon-1',
        primaryText: 'AEON Mall Phnom Penh',
        secondaryText: 'Samdech Sothearos Blvd',
        description: 'AEON Mall Phnom Penh, Samdech Sothearos Blvd',
      },
    ]);

    const place = await getPlaceDetailsById('aeon-1');
    expect(place).toEqual({
      placeId: 'aeon-1',
      name: 'AEON Mall Phnom Penh',
      address: 'No. 132, Samdech Sothearos Blvd, Phnom Penh',
      coordinates: { lat: 11.547654, lng: 104.933322 },
    });
    expect(typeof place.coordinates.lat).toBe('number');
    expect(typeof place.coordinates.lng).toBe('number');
  });

  it('supports AdvancedMarkerElement dragend and falls back to classic Marker cleanly', () => {
    const callbacks: {
      advDrag?: (e: { latLng: { lat: () => number; lng: () => number } }) => void;
      classicDrag?: (e: { latLng: null }) => void;
    } = {};

    const advMarkerInstance = {
      position: { lat: 11.55, lng: 104.92 },
      map: null as unknown,
      addListener: vi.fn((event: string, cb: NonNullable<typeof callbacks.advDrag>) => {
        if (event === 'dragend') callbacks.advDrag = cb;
        return { remove: vi.fn() };
      }),
    };
    const mockMap = {} as never;
    const onDragEnd = vi.fn();

    const advMaps = {
      Map: vi.fn(),
      Geocoder: vi.fn(),
      marker: {
        AdvancedMarkerElement: vi.fn(() => advMarkerInstance),
      },
    } as unknown as GoogleMapsNamespace;

    const handle = createDraggableMarker(
      advMaps,
      mockMap,
      { lat: 11.55, lng: 104.92 },
      'Pin',
      onDragEnd,
    );
    callbacks.advDrag?.({ latLng: { lat: () => 11.561234, lng: () => 104.918765 } });
    expect(onDragEnd).toHaveBeenCalledWith({ lat: 11.561234, lng: 104.918765 });
    handle.setPosition({ lat: 11.57, lng: 104.93 });
    expect(advMarkerInstance.position).toEqual({ lat: 11.57, lng: 104.93 });
    handle.cleanup();
    expect(advMarkerInstance.map).toBeNull();

    // Fallback to classic marker when AdvancedMarkerElement throws
    const classicSetPos = vi.fn();
    const fallbackMaps = {
      Map: vi.fn(),
      Geocoder: vi.fn(),
      marker: {
        AdvancedMarkerElement: vi.fn(() => {
          throw new Error('Map ID missing');
        }),
      },
      Marker: vi.fn(() => ({
        setPosition: classicSetPos,
        setMap: vi.fn(),
        getPosition: () => ({ lat: () => 11.58, lng: () => 104.9 }),
        addListener: vi.fn((_ev: string, cb: NonNullable<typeof callbacks.classicDrag>) => {
          callbacks.classicDrag = cb;
          return { remove: vi.fn() };
        }),
      })),
    } as unknown as GoogleMapsNamespace;

    const classicHandle = createDraggableMarker(
      fallbackMaps,
      mockMap,
      { lat: 11.55, lng: 104.92 },
      'Classic Pin',
      onDragEnd,
    );
    callbacks.classicDrag?.({ latLng: null });
    expect(onDragEnd).toHaveBeenCalledWith({ lat: 11.58, lng: 104.9 });
    classicHandle.setPosition({ lat: 11.59, lng: 104.91 });
    expect(classicSetPos).toHaveBeenCalledWith({ lat: 11.59, lng: 104.91 });
    expect(toNumericCoords(null)).toBeNull();
  });

  it('updates pickup and targeted multi-drop stops independently without mutating other stops', () => {
    const initialPickup: BookingFormData['pickup'] = {
      id: 'loc-1',
      name: 'Main Shop',
      address: 'Old Warehouse St 100',
      coordinates: { lat: 11.55, lng: 104.92 },
      senderName: 'Dara',
      senderPhone: '012888999',
      riderNote: 'Blue gate',
    };

    const updatedPickup = applyConfirmedPickupLocation(initialPickup, {
      name: 'New Studio',
      address: 'St 271, Toul Tompoung, Phnom Penh',
      coordinates: { lat: 11.535, lng: 104.912 },
      placeId: 'place-271',
    });

    expect(updatedPickup.address).toBe('St 271, Toul Tompoung, Phnom Penh');
    expect(updatedPickup.coordinates).toEqual({ lat: 11.535, lng: 104.912 });
    expect(updatedPickup.placeId).toBe('place-271');
    expect(updatedPickup.senderName).toBe('Dara');
    expect(updatedPickup.senderPhone).toBe('012888999');
    expect(updatedPickup.riderNote).toBe('Blue gate');

    const stops: NonNullable<BookingFormData['dropoffs']> = [
      {
        id: 'stop-1',
        recipient: { name: 'Sokha', phoneNumber: '012111222' },
        dropoff: { address: 'BKK1 Stop 1', coordinates: { lat: 11.551, lng: 104.925 } },
      },
      {
        id: 'stop-2',
        recipient: { name: 'Bopha', phoneNumber: '099333444' },
        dropoff: { address: 'TK Stop 2', coordinates: { lat: 11.576, lng: 104.899 } },
      },
    ];

    // Editing stop 2 must leave stop 1 and primary dropoff completely unchanged
    const stop2Update = applyConfirmedDropoffLocation({
      dropoffs: stops,
      fallbackDropoff: stops[0].dropoff,
      activeStopIndex: 1,
      selected: {
        name: 'Sen Sok Mall',
        address: 'AEON Sen Sok, Phnom Penh',
        coordinates: { lat: 11.599, lng: 104.885 },
        placeId: 'place-aeon2',
      },
    });

    expect(stop2Update.primaryDropoffToSync).toBeUndefined();
    expect(stop2Update.nextDropoffs?.[0]).toEqual(stops[0]);
    expect(stop2Update.nextDropoffs?.[1].recipient).toEqual(stops[1].recipient);
    expect(stop2Update.nextDropoffs?.[1].dropoff).toEqual({
      address: 'AEON Sen Sok, Phnom Penh',
      coordinates: { lat: 11.599, lng: 104.885 },
      placeId: 'place-aeon2',
    });

    // Editing stop 1 updates stop 1 + primary sync while preserving stop 2
    const stop1Update = applyConfirmedDropoffLocation({
      dropoffs: stops,
      fallbackDropoff: stops[0].dropoff,
      activeStopIndex: 0,
      selected: {
        name: 'Wat Phnom',
        address: 'Wat Phnom, Daun Penh, Phnom Penh',
        coordinates: { lat: 11.5762, lng: 104.923 },
        placeId: 'place-wp',
      },
    });
    expect(stop1Update.primaryDropoffToSync).toEqual(stop1Update.nextDropoffs?.[0].dropoff);
    expect(stop1Update.nextDropoffs?.[1]).toEqual(stops[1]);
  });

  it('provides complete English and Khmer translations for LocationPicker', () => {
    const enPicker = enMessages.LocationPicker as Record<string, string>;
    const kmPicker = kmMessages.LocationPicker as Record<string, string>;

    const enKeys = Object.keys(enPicker);
    expect(enKeys.length).toBeGreaterThan(25);
    for (const key of enKeys) {
      expect(typeof enPicker[key]).toBe('string');
      expect(enPicker[key].trim().length).toBeGreaterThan(0);
      expect(typeof kmPicker[key]).toBe('string');
      expect(kmPicker[key].trim().length).toBeGreaterThan(0);
    }
  });
});
