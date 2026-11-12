import 'server-only';
import { isAxiosError } from 'axios';
import { ConsumerApiError, getRequestLanguage } from './api-response';
import {
  extractUnifiedErrorMessage,
  isUnifiedFailureResponse,
} from './unified-jwt';

export interface UnifiedHeaderOptions {
  accessToken: string;
  acceptLanguage?: string;
  includeJsonContentType?: boolean;
  platform?: string;
  apiVersion?: string;
  appVersion?: string;
}

export const extractUnifiedAcceptLanguage = getRequestLanguage;

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
 * Validates Wing Unified response envelopes (`{ result: false }`) returned by Axios
 * and throws `ConsumerApiError` with localized gateway messages.
 */
export function unwrapUnifiedAxiosData<T>(
  rawData: unknown,
  httpStatus = 200,
): T {
  if (httpStatus >= 400 || isUnifiedFailureResponse(rawData)) {
    const status = httpStatus >= 400 ? httpStatus : 400;
    throw new ConsumerApiError(
      extractUnifiedErrorMessage(rawData, status),
      status,
    );
  }
  return rawData as T;
}

/**
 * Normalizes Axios or HTTP failures in external Wing integrations into `ConsumerApiError`.
 */
export function handleUnifiedAxiosError(
  err: unknown,
  fallbackMessage: string,
): never {
  if (err instanceof ConsumerApiError) throw err;

  if (isAxiosError(err)) {
    if (err.response) {
      const status = err.response.status || 400;
      throw new ConsumerApiError(
        extractUnifiedErrorMessage(err.response.data, status),
        status,
      );
    }
    throw new ConsumerApiError(fallbackMessage, 503);
  }

  throw new ConsumerApiError(fallbackMessage, 503);
}

