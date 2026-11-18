import { beforeEach, describe, expect, it } from 'vitest';
import {
  isResolvableGoogleMapsUrl,
  isTrustedGoogleMapsHostname,
} from '@/lib/google-maps-link';
import { sanitizePaymentRedirectUrl } from '@/lib/safe-url';
import { sanitizeSpreadsheetCell } from '@/features/booking/services/booking-export-service';
import { assertSameOriginRequest } from '@/server/lib/api-response';
import {
  checkRateLimit,
  resetRateLimiterForTests,
} from '@/server/lib/rate-limit';

describe('Security Hardening — SSRF Google Maps Allowlist', () => {
  it('accepts official Google Maps hosts and shorteners', () => {
    expect(isTrustedGoogleMapsHostname('maps.google.com')).toBe(true);
    expect(isTrustedGoogleMapsHostname('www.google.com')).toBe(true);
    expect(isTrustedGoogleMapsHostname('google.com.kh')).toBe(true);
    expect(isTrustedGoogleMapsHostname('maps.google.co.uk')).toBe(true);
    expect(isTrustedGoogleMapsHostname('maps.app.goo.gl')).toBe(true);
    expect(isTrustedGoogleMapsHostname('g.page')).toBe(true);
    expect(
      isResolvableGoogleMapsUrl('https://maps.app.goo.gl/abc123XYZ'),
    ).toBe(true);
    expect(
      isResolvableGoogleMapsUrl('https://www.google.com.kh/maps/place/BKK1'),
    ).toBe(true);
  });

  it('rejects attacker lookalike domains, embedded credentials, and custom ports', () => {
    expect(isTrustedGoogleMapsHostname('google.attacker.com')).toBe(false);
    expect(isTrustedGoogleMapsHostname('maps.google.internal.local')).toBe(false);
    expect(isTrustedGoogleMapsHostname('google.evil.co.uk')).toBe(false);
    expect(
      isResolvableGoogleMapsUrl('https://google.attacker.com/maps/test'),
    ).toBe(false);
    expect(
      isResolvableGoogleMapsUrl('https://user:pass@maps.google.com/maps'),
    ).toBe(false);
    expect(
      isResolvableGoogleMapsUrl('https://maps.google.com:8080/maps'),
    ).toBe(false);
  });
});

describe('Security Hardening — External Payment URL Sanitization', () => {
  it('rejects javascript:, data:, http:, credentials, and untrusted hosts', () => {
    expect(sanitizePaymentRedirectUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizePaymentRedirectUrl('data:text/html,<script>1</script>')).toBeNull();
    expect(sanitizePaymentRedirectUrl('http://pay.wingbank.com/checkout')).toBeNull();
    expect(
      sanitizePaymentRedirectUrl('https://user:pass@pay.wingbank.com/checkout'),
    ).toBeNull();
    expect(
      sanitizePaymentRedirectUrl('https://phishing.example/pay', {
        requireTrustedHost: true,
      }),
    ).toBeNull();
  });

  it('allows trusted HTTPS payment gateway URLs', () => {
    expect(
      sanitizePaymentRedirectUrl('https://pay.wingbank.com.kh/checkout/123', {
        requireTrustedHost: true,
      }),
    ).toBe('https://pay.wingbank.com.kh/checkout/123');
    expect(
      sanitizePaymentRedirectUrl('https://qa.wingmall.com/payment/abc', {
        requireTrustedHost: true,
      }),
    ).toBe('https://qa.wingmall.com/payment/abc');
  });
});

describe('Security Hardening — CSRF Origin Verification', () => {
  it('allows same-origin requests and requests without Origin header', () => {
    const sameOriginReq = new Request('https://express.wingbank.com/api/bookings', {
      method: 'POST',
      headers: {
        host: 'express.wingbank.com',
        origin: 'https://express.wingbank.com',
      },
    });
    expect(assertSameOriginRequest(sameOriginReq)).toBeNull();

    const noOriginReq = new Request('https://express.wingbank.com/api/bookings', {
      method: 'POST',
      headers: { host: 'express.wingbank.com' },
    });
    expect(assertSameOriginRequest(noOriginReq)).toBeNull();
  });

  it('rejects cross-origin mutating requests with 403', () => {
    const crossOriginReq = new Request('https://express.wingbank.com/api/bookings', {
      method: 'POST',
      headers: {
        host: 'express.wingbank.com',
        origin: 'https://evil.example',
      },
    });
    const res = assertSameOriginRequest(crossOriginReq);
    expect(res?.status).toBe(403);
  });
});

describe('Security Hardening — Sliding-Window Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('blocks requests exceeding the configured window limit and recovers after expiry', () => {
    const now = 1_700_000_000_000;
    expect(checkRateLimit('test-key', 2, 10_000, now).allowed).toBe(true);
    expect(checkRateLimit('test-key', 2, 10_000, now + 1000).allowed).toBe(true);

    const blocked = checkRateLimit('test-key', 2, 10_000, now + 2000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    expect(checkRateLimit('test-key', 2, 10_000, now + 11_000).allowed).toBe(true);
  });
});

describe('Security Hardening — Spreadsheet Formula Injection Neutralization', () => {
  it('prefixes formula trigger characters while leaving normal strings intact', () => {
    expect(sanitizeSpreadsheetCell('=SUM(A1:A5)')).toBe("'=SUM(A1:A5)");
    expect(sanitizeSpreadsheetCell('+855 12 888 999')).toBe("'+855 12 888 999");
    expect(sanitizeSpreadsheetCell('-1+2')).toBe("'-1+2");
    expect(sanitizeSpreadsheetCell('@cmd')).toBe("'@cmd");
    expect(sanitizeSpreadsheetCell('Sokha Chan')).toBe('Sokha Chan');
  });
});
