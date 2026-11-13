import { GoogleMapsNamespace } from './google-maps-types';

export type {
  GoogleAdvancedMarkerElement,
  GoogleClassicMarkerInstance,
  GoogleLatLng,
  GoogleLatLngLiteral,
  GoogleMapInstance,
  GoogleMapsNamespace,
} from './google-maps-types';

export type GoogleMapsErrorCode =
  | 'SSR_UNAVAILABLE'
  | 'MISSING_API_KEY'
  | 'SCRIPT_LOAD_ERROR';

export class GoogleMapsLoadError extends Error {
  readonly code: GoogleMapsErrorCode;

  constructor(code: GoogleMapsErrorCode, message: string) {
    super(message);
    this.name = 'GoogleMapsLoadError';
    this.code = code;
  }
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
    __wingExpressInitMaps?: () => void;
  }
}

const SCRIPT_ELEMENT_ID = 'wingexpress-google-maps-script';
let cachedLoadPromise: Promise<GoogleMapsNamespace> | null = null;

export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_MAP_API_KEY ||
    ''
  ).trim();
}

export function getGoogleMapsMapId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID').trim();
}

async function ensureRequiredLibraries(
  maps: GoogleMapsNamespace,
): Promise<GoogleMapsNamespace> {
  if (typeof maps.importLibrary === 'function') {
    await Promise.allSettled([
      maps.importLibrary('maps'),
      maps.importLibrary('places'),
      maps.importLibrary('marker'),
    ]);
  }
  return maps;
}

/**
 * Loads the Google Maps JS SDK once per browser session and initializes
 * Maps, Places, Geocoding, and Advanced Marker libraries.
 */
export function loadGoogleMapsApi(): Promise<GoogleMapsNamespace> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new GoogleMapsLoadError(
        'SSR_UNAVAILABLE',
        'Google Maps cannot load outside a browser context.',
      ),
    );
  }

  if (window.google?.maps?.Map) {
    return ensureRequiredLibraries(window.google.maps);
  }

  if (cachedLoadPromise) {
    return cachedLoadPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new GoogleMapsLoadError(
        'MISSING_API_KEY',
        'Google Maps API key is not configured.',
      ),
    );
  }

  cachedLoadPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const existingScript = document.getElementById(
      SCRIPT_ELEMENT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript && window.google?.maps) {
      ensureRequiredLibraries(window.google.maps).then(resolve, reject);
      return;
    }

    const handleFailure = (message: string) => {
      cachedLoadPromise = null;
      reject(new GoogleMapsLoadError('SCRIPT_LOAD_ERROR', message));
    };

    window.__wingExpressInitMaps = () => {
      const maps = window.google?.maps;
      if (!maps) {
        handleFailure('Google Maps loaded without namespace.');
        return;
      }
      ensureRequiredLibraries(maps).then(resolve, () =>
        handleFailure('Failed to initialize Google Maps libraries.'),
      );
    };

    const script = existingScript ?? document.createElement('script');
    script.id = SCRIPT_ELEMENT_ID;
    script.async = true;
    script.defer = true;
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places,marker',
      v: 'weekly',
      callback: '__wingExpressInitMaps',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onerror = () => {
      handleFailure('Unable to load Google Maps script.');
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return cachedLoadPromise;
}

export function resetGoogleMapsLoaderForTests(): void {
  cachedLoadPromise = null;
}
