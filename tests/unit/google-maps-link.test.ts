import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatDetectedLocationAddress,
  isDetectableLocationInput,
  isResolvableGoogleMapsUrl,
  parseGoogleMapsLocationInput,
} from '@/lib/google-maps-link';
import { POST as resolvePost } from '@/app/api/locations/resolve/route';

describe('Google Maps link & coordinate detection', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('parses raw decimal, labeled, compass, and DMS coordinate formats', () => {
    expect(parseGoogleMapsLocationInput('11.544355, 104.937540')?.coordinates).toEqual({
      lat: 11.544355,
      lng: 104.93754,
    });
    expect(parseGoogleMapsLocationInput('11.544355,+104.937540')?.coordinates).toEqual({
      lat: 11.544355,
      lng: 104.93754,
    });
    expect(parseGoogleMapsLocationInput('11.544355 104.937540')?.coordinates).toEqual({
      lat: 11.544355,
      lng: 104.93754,
    });
    expect(parseGoogleMapsLocationInput('lat: 11.5512, lng: 104.9256')?.coordinates).toEqual({
      lat: 11.5512,
      lng: 104.9256,
    });
    expect(parseGoogleMapsLocationInput('11.5512° S, 104.9256° W')?.coordinates).toEqual({
      lat: -11.5512,
      lng: -104.9256,
    });

    const dms = parseGoogleMapsLocationInput(`11°32'39.7"N 104°56'15.1"E`);
    expect(dms?.coordinates.lat).toBeCloseTo(11.544361, 5);
    expect(dms?.coordinates.lng).toBeCloseTo(104.937528, 5);
  });

  it('parses Google Maps URLs including !3d!4d pins, /maps/search/lat,+lng, query params, and geo URIs', () => {
    const searchUrl = parseGoogleMapsLocationInput(
      'https://www.google.com/maps/search/11.544355,+104.937540?entry=tts',
    );
    expect(searchUrl?.coordinates).toEqual({ lat: 11.544355, lng: 104.93754 });

    const placeUrl = parseGoogleMapsLocationInput(
      'https://www.google.com/maps/place/Aeon+Mall/@11.5400,104.9300,17z/data=!3m1!4b1!4m6!3m5!1s0x0!8m2!3d11.547654!4d104.933321',
    );
    expect(placeUrl?.coordinates).toEqual({ lat: 11.547654, lng: 104.933321 });
    expect(placeUrl?.label).toBe('Aeon Mall');

    const qUrl = parseGoogleMapsLocationInput('https://maps.google.com/?q=11.5512%2C104.9256');
    expect(qUrl?.coordinates).toEqual({ lat: 11.5512, lng: 104.9256 });

    const geoUri = parseGoogleMapsLocationInput('geo:0,0?q=11.5512,104.9256(Warehouse)');
    expect(geoUri?.coordinates).toEqual({ lat: 11.5512, lng: 104.9256 });
  });

  it('detects short Google Maps URLs including links inside chat text while rejecting non-Google URLs and normal addresses', () => {
    expect(isResolvableGoogleMapsUrl('https://maps.app.goo.gl/y53x7Nzv45yMcqdD6')).toBe(true);
    expect(isDetectableLocationInput('Send here: https://maps.app.goo.gl/y53x7Nzv45yMcqdD6')).toBe(
      true,
    );

    expect(parseGoogleMapsLocationInput('No 12, St 51, Phnom Penh')).toBeNull();
    expect(parseGoogleMapsLocationInput('12.5kg apparel box')).toBeNull();
    expect(isDetectableLocationInput('St 271, Toul Tompoung, Phnom Penh')).toBe(false);

    expect(isResolvableGoogleMapsUrl('http://127.0.0.1/maps/@11.55,104.92')).toBe(false);
    expect(parseGoogleMapsLocationInput('https://evil.example/maps/@11.55,104.92')).toBeNull();
  });

  it('resolves short Google Maps share links via POST /api/locations/resolve', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 302,
      ok: false,
      headers: new Headers({
        location:
          'https://www.google.com/maps/search/11.544355,+104.937540?entry=tts&skid=abc',
      }),
    }) as unknown as typeof fetch;

    const req = new Request('http://localhost/api/locations/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'https://maps.app.goo.gl/y53x7Nzv45yMcqdD6' }),
    });

    const res = await resolvePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.coordinates).toEqual({ lat: 11.544355, lng: 104.93754 });
    expect(json.address).toBe(
      formatDetectedLocationAddress({ lat: 11.544355, lng: 104.93754 }),
    );
  });

  it('blocks non-Google hosts on POST /api/locations/resolve', async () => {
    const req = new Request('http://localhost/api/locations/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'https://internal.local/secret' }),
    });

    const res = await resolvePost(req);
    expect(res.status).toBe(400);
  });
});

