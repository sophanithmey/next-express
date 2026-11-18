import 'server-only';
import { NextResponse } from 'next/server';

interface RateLimitBucket {
  timestamps: number[];
}

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, RateLimitBucket>();

function pruneStaleBuckets(now: number, maxWindowMs: number): void {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets.entries()) {
    const latest = bucket.timestamps[bucket.timestamps.length - 1] ?? 0;
    if (now - latest > maxWindowMs) {
      buckets.delete(key);
    }
  }
}

/**
 * Extracts best-effort client IP from reverse proxy headers (Vercel / Cloudflare / standard proxy).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Sliding-window in-memory rate limiter for Next.js BFF routes.
 * Note: For multi-instance / horizontally scaled deployments, back this with
 * a distributed store (e.g. Redis / Upstash) or edge WAF rules.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  pruneStaleBuckets(now, windowMs);
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000),
    );
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}

/**
 * Builds a standardized 429 Too Many Requests JSON response with Retry-After header.
 */
export function rateLimitExceededResponse(
  retryAfterSeconds: number,
  message = 'Too many requests. Please wait a moment and try again.',
): NextResponse {
  return NextResponse.json(
    { success: false, message, code: 'RATE_LIMITED' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, retryAfterSeconds)),
      },
    },
  );
}

/**
 * Resets in-memory buckets (for unit testing only).
 */
export function resetRateLimiterForTests(): void {
  buckets.clear();
}
