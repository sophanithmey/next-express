import 'server-only';
import { getServerEnv } from '../config/server-env';
import { toUnifiedUsernamePhone } from '@/lib/phone-number';
import { AuthTokenResponse } from '@/features/auth/types/auth-types';
import {
  computeExpiresInSeconds,
  decodeJwtPayload,
  extractUnifiedAuthType,
  extractUnifiedErrorMessage,
  extractUnifiedTokenBody,
  isUnifiedFailureResponse,
  mapUnifiedClaimsToProfile,
} from './unified-jwt';

export class ConsumerApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'ConsumerApiError';
  }
}

async function postUnifiedJson(
  path: string,
  body: Record<string, string | null>,
  extraHeaders?: Record<string, string>
): Promise<unknown> {
  const env = getServerEnv();

  try {
    const response = await fetch(`${env.identityApiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const rawData: unknown = await response.json().catch(() => ({}));

    if (!response.ok || isUnifiedFailureResponse(rawData)) {
      const status = response.ok ? 400 : response.status;
      throw new ConsumerApiError(
        extractUnifiedErrorMessage(rawData, status),
        status
      );
    }

    return rawData;
  } catch (err: unknown) {
    if (err instanceof ConsumerApiError) throw err;
    throw new ConsumerApiError(
      'Unable to connect to Unified Authentication Service. Please try again.',
      503
    );
  }
}

/**
 * Checks the consumer's authentication type via `POST /identity/v1/auth/check-type`
 * and rejects non-PIN accounts.
 */
export async function checkUnifiedPinAuthType(phoneNumber: string): Promise<string> {
  const env = getServerEnv();
  if (!env.identityClientId) {
    throw new ConsumerApiError(
      'Unified Identity client ID is not configured on the server.',
      500,
      'MISSING_CLIENT_CREDENTIALS'
    );
  }

  const rawData = await postUnifiedJson('/auth/check-type', {
    client_id: env.identityClientId,
    username: toUnifiedUsernamePhone(phoneNumber),
  });

  const authType = extractUnifiedAuthType(rawData);
  if (!authType || authType.toUpperCase() !== 'PIN') {
    throw new ConsumerApiError(
      authType
        ? `Account authentication type "${authType}" is not supported for PIN login.`
        : 'Unable to determine account authentication type.',
      400,
      'UNSUPPORTED_AUTH_TYPE'
    );
  }

  return authType;
}

/**
 * Requests access/refresh tokens from `POST /identity/v1/auth/token`.
 */
export async function requestUnifiedToken(
  body: Record<string, string | null>,
  fallbackPhone: string
): Promise<AuthTokenResponse> {
  const env = getServerEnv();
  if (!env.identityClientId || !env.identityClientSecret) {
    throw new ConsumerApiError(
      'Unified Identity client credentials are not configured on the server.',
      500,
      'MISSING_CLIENT_CREDENTIALS'
    );
  }

  const rawData = await postUnifiedJson('/auth/token', body);
  const tokenData = extractUnifiedTokenBody(rawData);

  if (!tokenData.accessToken) {
    throw new ConsumerApiError(
      extractUnifiedErrorMessage(rawData, 401),
      401,
      'MISSING_ACCESS_TOKEN'
    );
  }

  const claims = decodeJwtPayload(tokenData.accessToken);
  const user = mapUnifiedClaimsToProfile(claims, fallbackPhone);
  const expiresIn = computeExpiresInSeconds(tokenData.expiresIn, claims);

  return {
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
    expiresIn,
    tokenType: tokenData.tokenType || 'Bearer',
    user,
  };
}

/**
 * Revokes an active Unified Identity token via `POST /identity/v1/portal/auth/logout`.
 */
export async function revokeUnifiedSession(accessToken: string): Promise<void> {
  await postUnifiedJson(
    '/portal/auth/logout',
    { grant_type: 'PASSWORD' },
    { Authorization: `Bearer ${accessToken}` }
  );
}

