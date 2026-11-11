import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  extractGoogleMapsUrl,
  formatDetectedLocationAddress,
  isResolvableGoogleMapsUrl,
  parseGoogleMapsLocationInput,
} from '@/lib/google-maps-link';
import { getServerEnv } from '@/server/config/server-env';

const resolveSchema = z.object({
  input: z.string().trim().min(1, 'Location input is required'),
});

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
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${coords.lat},${coords.lng}`);
    url.searchParams.set('key', env.mapServerApiKey);

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    if (!res.ok) return undefined;

    const data = (await res.json()) as {
      results?: Array<{ formatted_address?: string }>;
    };
    return data.results?.[0]?.formatted_address?.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function buildResolvedResponse(
  coordinates: GeoCoordinates,
  placeName: string | undefined,
  resolvedUrl: string,
) {
  const geocoded = await reverseGeocodeIfConfigured(coordinates);
  return NextResponse.json({
    coordinates,
    placeName,
    address: geocoded || formatDetectedLocationAddress(coordinates, placeName),
    resolvedUrl,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsedBody = resolveSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.errors[0]?.message || 'Invalid input' },
        { status: 400 },
      );
    }

    const input = parsedBody.data.input;
    const direct = parseGoogleMapsLocationInput(input);
    if (direct) {
      return buildResolvedResponse(direct.coordinates, direct.label, input);
    }

    if (!isResolvableGoogleMapsUrl(input)) {
      return NextResponse.json(
        { message: 'Please provide a valid Google Maps link or latitude, longitude.' },
        { status: 400 },
      );
    }

    let currentUrl = extractGoogleMapsUrl(input) || input;
    for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      });

      if (res.status >= 300 && res.status < 400) {
        const locationHeader = res.headers.get('location');
        if (!locationHeader) break;
        const nextUrl = new URL(locationHeader, currentUrl).toString();
        if (!isGoogleMapsRedirectHost(nextUrl)) {
          return NextResponse.json(
            { message: 'Unsupported redirect host for Google Maps resolution.' },
            { status: 400 },
          );
        }

        const fromRedirect = parseGoogleMapsLocationInput(nextUrl);
        if (fromRedirect) {
          return buildResolvedResponse(fromRedirect.coordinates, fromRedirect.label, nextUrl);
        }

        currentUrl = nextUrl;
        continue;
      }

      if (res.ok) {
        const html = await res.text();
        const fromHtml = extractCoordinatesFromHtml(html);
        if (fromHtml) {
          return buildResolvedResponse(fromHtml.coordinates, fromHtml.label, currentUrl);
        }
      }
      break;
    }

    return NextResponse.json(
      {
        message:
          'Could not extract coordinates from this Google Maps link. Try copying the full URL or latitude, longitude.',
      },
      { status: 422 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Unable to resolve Google Maps link right now.' },
      { status: 502 },
    );
  }
}
