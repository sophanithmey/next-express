import 'server-only';
import { UNIFIED_API_PATHS } from '@/lib/constants';

export interface ServerEnvConfig {
  wingExpressApiUrl: string;
  identityApiBaseUrl: string;
  identityClientId: string;
  identityClientSecret: string;
  identityRsaPublicKey?: string;
  identityRsaPadding: 'pkcs1' | 'oaep';
  userApiBaseUrl: string;
  addressApiBaseUrl: string;
  orderApiBaseUrl: string;
  paymentApiBaseUrl: string;
  consumerApiBaseUrl: string;
  consumerClientId: string;
  expressApiBaseUrl: string;
  sessionSecret: string;
  mockAuthApi: boolean;
  mockAddressApi: boolean;
  mockOrderApi: boolean;
  mockPaymentApi: boolean;
  mockUpstreamApi: boolean;
  mapServerApiKey?: string;
}

function resolveWingExpressRootUrl(): string {
  const raw =
    process.env.WING_EXPRESS_API_URL ||
    process.env.BASE_URL_UNIFIED ||
    'https://qa.wingmall.com';
  return raw.replace(/\/+$/, '');
}

function resolveUnifiedServiceUrl(
  explicitEnvVar: string | undefined,
  servicePath: string,
  rootUrl: string,
): string {
  if (explicitEnvVar) {
    return explicitEnvVar.replace(/\/+$/, '');
  }
  const normalizedPath = servicePath.startsWith('/')
    ? servicePath
    : `/${servicePath}`;
  return `${rootUrl}${normalizedPath}`.replace(/\/+$/, '');
}

function resolveMockFlag(
  explicit: string | undefined,
  fallback: boolean,
): boolean {
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return fallback;
}

export const DEFAULT_DEV_SESSION_SECRET =
  'express_seller_secure_jwt_session_encryption_key_32_chars_min!';

export function getServerEnv(): ServerEnvConfig {
  const rawSessionSecret = process.env.SESSION_SECRET?.trim();
  const sessionSecret = rawSessionSecret || DEFAULT_DEV_SESSION_SECRET;

  if (
    process.env.NODE_ENV === 'production' &&
    (!rawSessionSecret ||
      rawSessionSecret === DEFAULT_DEV_SESSION_SECRET ||
      rawSessionSecret.length < 32)
  ) {
    console.warn(
      '[SECURITY WARNING] SESSION_SECRET is missing, weak (<32 chars), or using the default placeholder in production.',
    );
  }

  const wingExpressApiUrl = resolveWingExpressRootUrl();
  const identityApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.IDENTITY_API_BASE_URL || process.env.CONSUMER_API_BASE_URL,
    UNIFIED_API_PATHS.IDENTITY,
    wingExpressApiUrl,
  );
  const userApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.USER_API_BASE_URL,
    UNIFIED_API_PATHS.USER,
    wingExpressApiUrl,
  );
  const addressApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.ADDRESS_API_BASE_URL,
    UNIFIED_API_PATHS.ADDRESS,
    wingExpressApiUrl,
  );
  const orderApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.ORDER_API_BASE_URL,
    UNIFIED_API_PATHS.ORDER,
    wingExpressApiUrl,
  );
  const paymentApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.PAYMENT_API_BASE_URL,
    UNIFIED_API_PATHS.PAYMENT,
    wingExpressApiUrl,
  );

  const identityClientId =
    process.env.IDENTITY_CONSUMER_CLIENT_ID ||
    process.env.IDENTITY_CLIENT_ID ||
    process.env.CONSUMER_CLIENT_ID ||
    '';
  const identityClientSecret =
    process.env.IDENTITY_CONSUMER_CLIENT_SECRET ||
    process.env.IDENTITY_CLIENT_SECRET ||
    '';

  const mockUpstreamApi =
    process.env.MOCK_UPSTREAM_API === 'true' ||
    !process.env.EXPRESS_API_BASE_URL ||
    process.env.EXPRESS_API_BASE_URL.includes('stage-api.wingbank.com');

  const mockAuthApi = resolveMockFlag(
    process.env.MOCK_AUTH_API,
    process.env.MOCK_UPSTREAM_API === 'true',
  );
  const mockAddressApi = resolveMockFlag(
    process.env.MOCK_ADDRESS_API,
    mockAuthApi,
  );
  const mockOrderApi = resolveMockFlag(process.env.MOCK_ORDER_API, mockAuthApi);
  const mockPaymentApi = resolveMockFlag(
    process.env.MOCK_PAYMENT_API,
    mockAuthApi,
  );

  const identityRsaPadding =
    process.env.IDENTITY_RSA_PADDING?.toLowerCase() === 'oaep'
      ? 'oaep'
      : 'pkcs1';

  return {
    wingExpressApiUrl,
    identityApiBaseUrl,
    identityClientId,
    identityClientSecret,
    identityRsaPublicKey:
      process.env.IDENTITY_RSA_PUBLIC_KEY?.trim() || undefined,
    identityRsaPadding,
    userApiBaseUrl,
    addressApiBaseUrl,
    orderApiBaseUrl,
    paymentApiBaseUrl,
    consumerApiBaseUrl: identityApiBaseUrl,
    consumerClientId: identityClientId || 'express-seller-web',
    expressApiBaseUrl:
      process.env.EXPRESS_API_BASE_URL ||
      'https://stage-api.wingbank.com/delivery/v1',
    sessionSecret,
    mockAuthApi,
    mockAddressApi,
    mockOrderApi,
    mockPaymentApi,
    mockUpstreamApi,
    mapServerApiKey:
      process.env.MAP_SERVER_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_MAP_API_KEY?.trim() ||
      undefined,
  };
}

/**
 * Validates critical environment settings on startup without exposing secret values.
 */
export function validateServerEnvOnStartup(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const env = getServerEnv();

  if (process.env.NODE_ENV === 'production') {
    if (
      !process.env.SESSION_SECRET?.trim() ||
      env.sessionSecret === DEFAULT_DEV_SESSION_SECRET ||
      env.sessionSecret.length < 32
    ) {
      issues.push('SESSION_SECRET must be at least 32 characters long in production.');
    }

    if (!env.mockAuthApi) {
      if (!env.identityClientId) {
        issues.push('IDENTITY_CONSUMER_CLIENT_ID is required when MOCK_AUTH_API is false.');
      }
      if (!env.identityClientSecret) {
        issues.push('IDENTITY_CONSUMER_CLIENT_SECRET is required when MOCK_AUTH_API is false.');
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

