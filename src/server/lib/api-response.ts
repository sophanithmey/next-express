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
          details: parsed.error.format(),
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

