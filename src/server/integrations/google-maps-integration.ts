import 'server-only';
import { serverAxios } from '@/lib/axios/server-axios';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  extractGoogleMapsUrl,
  formatDetectedLocationAddress,
  isResolvableGoogleMapsUrl,
  parseGoogleMapsLocationInput,
} from '@/lib/google-maps-link';
import { getServerEnv } from '@/server/lib/env';
import { ConsumerApiError } from '@/server/lib/api-response';

export interface ResolvedMapLocation {
  coordinates: GeoCoordinates;
  placeName?: string;
  address: string;
  resolvedUrl: string;
}

const MAX_REDIRECTS = 6;

function isGoogleMapsRedirectHost(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return (
      host === 'maps.app.goo.gl' ||
      host === 'goo.gl' ||
      host === 'g.page' ||
      /^maps\.google\.[a-z.]+$/.test(host) ||
      /^google\.[a-z.]+$/.test(host)
    );
  } catch {
    return false;
  }
}

function extractCoordinatesFromHtml(
  html: string,
): { coordinates: GeoCoordinates; label?: string } | null {
  const sample = html.slice(0, 200_000);
  const titleMatch = sample.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  const rawLabel = titleMatch?.[1]?.replace(/\s*-\s*Google Maps$/i, '').trim();

  const patterns = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /center=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = sample.match(pattern);
    if (!match) continue;
    const parsed = parseGoogleMapsLocationInput(`${match[1]}, ${match[2]}`);
    if (parsed) {
      return {
        coordinates: parsed.coordinates,
        label: rawLabel && rawLabel !== 'Google Maps' ? rawLabel : undefined,
      };
    }
  }
  return null;
}

async function reverseGeocodeIfConfigured(
  coords: GeoCoordinates,
): Promise<string | undefined> {
  const env = getServerEnv();
  if (!env.mapServerApiKey) return undefined;

  try {
    const res = await serverAxios.request<{
      results?: Array<{ formatted_address?: string }>;
    }>({
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      method: 'GET',
      params: { latlng: `${coords.lat},${coords.lng}`, key: env.mapServerApiKey },
      timeout: 2500,
    });
    return res.data.results?.[0]?.formatted_address?.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function buildResolvedLocation(
  coordinates: GeoCoordinates,
  placeName: string | undefined,
  resolvedUrl: string,
): Promise<ResolvedMapLocation> {
  const geocoded = await reverseGeocodeIfConfigured(coordinates);
  return {
    coordinates,
    placeName,
    address: geocoded || formatDetectedLocationAddress(coordinates, placeName),
    resolvedUrl,
  };
}

export const googleMapsIntegration = {
  async resolveLocationInput(input: string): Promise<ResolvedMapLocation> {
    const direct = parseGoogleMapsLocationInput(input);
    if (direct) {
      return buildResolvedLocation(direct.coordinates, direct.label, input);
    }

    if (!isResolvableGoogleMapsUrl(input)) {
      throw new ConsumerApiError(
        'Please provide a valid Google Maps link or latitude, longitude.',
        400,
      );
    }

    let currentUrl = extractGoogleMapsUrl(input) || input;
    for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
      const res = await serverAxios.request<string>({
        url: currentUrl,
        method: 'GET',
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 5000,
        responseType: 'text',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const locationHeader = res.headers?.location as string | undefined;
        if (!locationHeader) break;
        const nextUrl = new URL(locationHeader, currentUrl).toString();
        if (!isGoogleMapsRedirectHost(nextUrl)) {
          throw new ConsumerApiError(
            'Unsupported redirect host for Google Maps resolution.',
            400,
          );
        }

        const fromRedirect = parseGoogleMapsLocationInput(nextUrl);
        if (fromRedirect) {
          return buildResolvedLocation(
            fromRedirect.coordinates,
            fromRedirect.label,
            nextUrl,
          );
        }
        currentUrl = nextUrl;
        continue;
      }

      if (res.status >= 200 && res.status < 300 && typeof res.data === 'string') {
        const fromHtml = extractCoordinatesFromHtml(res.data);
        if (fromHtml) {
          return buildResolvedLocation(
            fromHtml.coordinates,
            fromHtml.label,
            currentUrl,
          );
        }
      }
      break;
    }

    throw new ConsumerApiError(
      'Could not extract coordinates from this Google Maps link. Try copying the full URL or latitude, longitude.',
      422,
    );
  },
};

