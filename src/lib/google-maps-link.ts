import { GeoCoordinates } from '@/features/booking/types/booking-types';

export interface ParsedMapLocation {
  coordinates: GeoCoordinates;
  label?: string;
  source: 'coordinates' | 'google_maps_url';
}

const ALLOWED_SHORT_HOSTS = new Set(['maps.app.goo.gl', 'g.page']);

function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function buildCoords(lat: number, lng: number): GeoCoordinates | null {
  if (!isValidCoordinates(lat, lng)) return null;
  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}

function parseDmsPart(
  deg: string,
  min: string,
  sec: string,
  dir: string,
): number {
  const value =
    parseFloat(deg) + parseFloat(min) / 60 + parseFloat(sec) / 3600;
  const upper = dir.toUpperCase();
  return upper === 'S' || upper === 'W' ? -Math.abs(value) : Math.abs(value);
}

function parseRawCoordinatePair(raw: string, requireDecimal = true): GeoCoordinates | null {
  const cleaned = raw
    .trim()
    .replace(/^loc:/i, '')
    .replace(/\([^()]*\)$/, '')
    .replace(/^[(\s]+|[)\s]+$/g, '');

  const dmsMatch = cleaned.match(
    /^(\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*([NS])[\s,+]+(\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*([EW])$/i,
  );
  if (dmsMatch) {
    return buildCoords(
      parseDmsPart(dmsMatch[1], dmsMatch[2], dmsMatch[3], dmsMatch[4]),
      parseDmsPart(dmsMatch[5], dmsMatch[6], dmsMatch[7], dmsMatch[8]),
    );
  }

  const labeledMatch = cleaned.match(
    /(?:lat(?:itude)?\s*[:=]\s*)(-?\d+(?:\.\d+)?)\s*[,;\s]+(?:lng|lon|long(?:itude)?)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i,
  );
  if (labeledMatch) {
    return buildCoords(parseFloat(labeledMatch[1]), parseFloat(labeledMatch[2]));
  }

  const compassMatch = cleaned.match(
    /^(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?[\s,+]+(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?$/i,
  );
  if (!compassMatch) return null;

  const hasDecimal =
    compassMatch[1].includes('.') || compassMatch[3].includes('.');
  const hasDirection = Boolean(compassMatch[2] || compassMatch[4]);
  if (requireDecimal && !hasDecimal && !hasDirection) {
    return null;
  }

  let lat = parseFloat(compassMatch[1]);
  let lng = parseFloat(compassMatch[3]);
  if (compassMatch[2]?.toUpperCase() === 'S') lat = -Math.abs(lat);
  if (compassMatch[4]?.toUpperCase() === 'W') lng = -Math.abs(lng);

  return buildCoords(lat, lng);
}

function extractPlaceLabelFromUrl(url: URL): string | undefined {
  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);
  if (placeMatch?.[1]) {
    const decoded = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ').trim();
    if (decoded && !parseRawCoordinatePair(decoded, false)) {
      return decoded;
    }
  }

  const qParam = url.searchParams.get('q') || url.searchParams.get('query');
  if (qParam) {
    const trimmed = qParam.trim();
    if (trimmed && !parseRawCoordinatePair(trimmed, false)) {
      return trimmed;
    }
  }
  return undefined;
}

export function extractGoogleMapsUrl(input: string): string | null {
  const urlMatch = input.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i);
  return urlMatch ? urlMatch[0] : null;
}

/**
 * Checks whether a string contains a Google Maps domain URL whose redirects/page
 * can be safely resolved server-side without SSRF risk.
 */
export function isResolvableGoogleMapsUrl(input: string): boolean {
  const candidate = /^https?:\/\//i.test(input.trim())
    ? input.trim()
    : extractGoogleMapsUrl(input);
  if (!candidate) return false;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (ALLOWED_SHORT_HOSTS.has(host)) return true;
    if (host === 'goo.gl' && url.pathname.startsWith('/maps')) return true;
    if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
    if (/^google\.[a-z.]+$/.test(host) && url.pathname.includes('/maps')) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Synchronously extracts coordinates and an optional place label from raw
 * lat/lng strings, `geo:` URIs, or full Google Maps URLs (even inside pasted text).
 */
export function parseGoogleMapsLocationInput(input: string): ParsedMapLocation | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^geo:/i.test(trimmed)) {
    const geoBody = trimmed.slice(4);
    const [coordPart, queryPart] = geoBody.split('?');
    if (queryPart) {
      const q = new URLSearchParams(queryPart).get('q');
      const fromQuery = q ? parseRawCoordinatePair(q, false) : null;
      if (fromQuery) return { coordinates: fromQuery, source: 'google_maps_url' };
    }
    const fromGeo = parseRawCoordinatePair(coordPart.split(';')[0] || '', false);
    if (fromGeo) return { coordinates: fromGeo, source: 'google_maps_url' };
  }

  const candidateUrl = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : extractGoogleMapsUrl(trimmed);

  if (candidateUrl && isResolvableGoogleMapsUrl(candidateUrl)) {
    try {
      const url = new URL(candidateUrl);
      const decodedFull = decodeURIComponent(candidateUrl);

      const dataPinMatch = decodedFull.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (dataPinMatch) {
        const coords = buildCoords(parseFloat(dataPinMatch[1]), parseFloat(dataPinMatch[2]));
        if (coords) {
          return {
            coordinates: coords,
            label: extractPlaceLabelFromUrl(url),
            source: 'google_maps_url',
          };
        }
      }

      const paramKeys = ['q', 'query', 'll', 'center', 'sll', 'destination', 'daddr', 'saddr'];
      for (const key of paramKeys) {
        const val = url.searchParams.get(key);
        if (!val) continue;
        const coords = parseRawCoordinatePair(val, false);
        if (coords) {
          return {
            coordinates: coords,
            label: extractPlaceLabelFromUrl(url),
            source: 'google_maps_url',
          };
        }
      }

      const pathMatch =
        decodedFull.match(/@(-?\d+(?:\.\d+)?)[,+\s]+(-?\d+(?:\.\d+)?)/) ||
        decodedFull.match(/\/(?:search|dir|place)\/[^/]*?(-?\d+(?:\.\d+)?)[,+\s]+(-?\d+(?:\.\d+)?)/);
      if (pathMatch) {
        const coords = buildCoords(parseFloat(pathMatch[1]), parseFloat(pathMatch[2]));
        if (coords) {
          return {
            coordinates: coords,
            label: extractPlaceLabelFromUrl(url),
            source: 'google_maps_url',
          };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  const rawCoords = parseRawCoordinatePair(trimmed, true);
  if (rawCoords) {
    return { coordinates: rawCoords, source: 'coordinates' };
  }

  return null;
}

export function isDetectableLocationInput(input: string): boolean {
  return Boolean(parseGoogleMapsLocationInput(input) || isResolvableGoogleMapsUrl(input));
}

export function formatDetectedLocationAddress(
  coordinates: GeoCoordinates,
  label?: string,
): string {
  const coordText = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
  return label ? `${label} (${coordText})` : `Google Pin (${coordText}), Phnom Penh`;
}
