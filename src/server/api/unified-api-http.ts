import 'server-only';
import { ConsumerApiError } from './consumer-api-client';
import {
  extractUnifiedErrorMessage,
  isUnifiedFailureResponse,
} from '../auth/unified-jwt';

export interface UnifiedHeaderOptions {
  accessToken: string;
  acceptLanguage?: string;
  includeJsonContentType?: boolean;
  platform?: string;
  apiVersion?: string;
  appVersion?: string;
}

/**
 * Builds standard Wing Unified API gateway headers matching collection specs.
 */
export function buildUnifiedHeaders({
  accessToken,
  acceptLanguage = 'EN',
  includeJsonContentType = false,
  platform = 'UNIFIED',
  apiVersion = 'v1',
  appVersion = 'v0.0.1',
}: UnifiedHeaderOptions): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${accessToken}`,
    'wing-platform': platform,
    'os-version': '1.0.0',
    'device-model': 'Web',
    'device-id': 'wing-express-web',
    'app-version': appVersion,
    'api-version': apiVersion,
    'request-id': crypto.randomUUID(),
    'accept-language': acceptLanguage.toUpperCase(),
  };
}

/**
 * Parses a Wing Unified API JSON response and throws `ConsumerApiError`
 * on non-2xx HTTP status or `{ result: false }` failure envelopes.
 */
export async function parseUnifiedResponse<T>(response: Response): Promise<T> {
  const rawData: unknown = await response.json().catch(() => ({}));
  if (!response.ok || isUnifiedFailureResponse(rawData)) {
    const status = response.ok ? 400 : response.status;
    throw new ConsumerApiError(
      extractUnifiedErrorMessage(rawData, status),
      status,
    );
  }
  return rawData as T;
}

