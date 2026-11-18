import 'server-only';
import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { z, ZodTypeAny } from 'zod';
import { SessionData } from '@/features/auth/types/auth-types';
import { sessionService } from './session';
import { extractUnifiedErrorMessage } from './unified-jwt';

export class ConsumerApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = 'ConsumerApiError';
  }
}

export class ExpressApiError extends ConsumerApiError {
  constructor(message: string, statusCode: number = 400, code?: string) {
    super(message, statusCode, code);
    this.name = 'ExpressApiError';
  }
}

/**
 * Extracts normalized Wing language header (`EN`, `KM`, or `ZH`).
 */
export function getRequestLanguage(request: Request): string {
  const code = (request.headers.get('accept-language') || 'EN')
    .slice(0, 2)
    .toUpperCase();
  return code === 'KM' || code === 'ZH' || code === 'EN' ? code : 'EN';
}

/**
 * Defense-in-depth CSRF check for state-changing Route Handlers.
 * If an `Origin` header is present on the request, verifies it matches the request's host.
 * Allows requests without an `Origin` header (same-origin non-browser or server calls)
 * while relying on `SameSite=Lax` cookies for browser-level protection.
 */
export function assertSameOriginRequest(request: Request): NextResponse | null {
  const originHeader = request.headers.get('origin');
  if (!originHeader) return null;

  const hostHeader =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!hostHeader) return null;

  try {
    const originHost = new URL(originHeader).host.toLowerCase();
    const expectedHost = hostHeader.split(',')[0]?.trim().toLowerCase();
    if (originHost !== expectedHost) {
      return NextResponse.json(
        { message: 'Cross-site request rejected', code: 'CSRF_ORIGIN_MISMATCH' },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { message: 'Invalid request origin', code: 'INVALID_ORIGIN' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Parses and validates JSON request bodies with a Zod schema.
 */
export async function parseRequestBody<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
  fallbackError = 'Validation failed',
): Promise<{ data: z.output<TSchema> } | { errorResponse: NextResponse }> {
  const rawBody: unknown = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      errorResponse: NextResponse.json(
        {
          message: parsed.error.errors[0]?.message || fallbackError,
          ...(process.env.NODE_ENV !== 'production'
            ? { details: parsed.error.format() }
            : {}),
        },
        { status: 400 },
      ),
    };
  }
  return { data: parsed.data as z.output<TSchema> };
}

/**
 * Resolves the active session and returns a 401 JSON response if unauthenticated.
 */
export async function requireAuthenticatedSession(
  unauthorizedMessage = 'Please sign in to continue.',
): Promise<{ session: SessionData } | { errorResponse: NextResponse }> {
  const session = await sessionService.getSession();
  if (!session?.accessToken) {
    return {
      errorResponse: NextResponse.json(
        { message: unauthorizedMessage },
        { status: 401 },
      ),
    };
  }
  return { session };
}

/**
 * Logs non-sensitive error summaries without tokens, secrets, or raw credentials.
 */
export function safeLogError(context: string, error: unknown): void {
  const status =
    error instanceof ConsumerApiError
      ? error.statusCode
      : isAxiosError(error)
        ? error.response?.status
        : undefined;
  const message =
    error instanceof Error ? error.message : 'Unknown server error';
  console.error(`[${context}]`, { status, message });
}

/**
 * Converts server/integration errors into consistent Next.js JSON responses.
 */
export function handleApiRouteError(
  error: unknown,
  fallbackMessage: string,
  options?: { includeSuccessFalse?: boolean },
): NextResponse {
  const prefix = options?.includeSuccessFalse ? { success: false } : {};

  if (error instanceof ConsumerApiError) {
    return NextResponse.json(
      { ...prefix, message: error.message, ...(error.code ? { code: error.code } : {}) },
      { status: error.statusCode },
    );
  }

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 502;
    const message = extractUnifiedErrorMessage(error.response?.data, status);
    return NextResponse.json({ ...prefix, message }, { status });
  }

  return NextResponse.json(
    { ...prefix, message: fallbackMessage },
    { status: 500 },
  );
}

