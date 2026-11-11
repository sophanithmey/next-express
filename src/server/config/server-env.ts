import 'server-only';
import { UNIFIED_API_PATHS } from '@/lib/constants';

export interface ServerEnvConfig {
  identityApiBaseUrl: string;
  identityClientId: string;
  identityClientSecret: string;
  identityRsaPublicKey?: string;
  identityRsaPadding: 'pkcs1' | 'oaep';
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

function resolveUnifiedServiceUrl(
  explicitEnvVar: string | undefined,
  servicePath: string
): string {
  if (explicitEnvVar) {
    return explicitEnvVar.replace(/\/+$/, '');
  }

  const base = (process.env.BASE_URL_UNIFIED || 'https://qa.wingmall.com').replace(
    /\/+$/,
    ''
  );
  const normalizedPath = servicePath.startsWith('/') ? servicePath : `/${servicePath}`;
  return `${base}${normalizedPath}`.replace(/\/+$/, '');
}

export function getServerEnv(): ServerEnvConfig {
  const sessionSecret =
    process.env.SESSION_SECRET ||
    'express_seller_secure_jwt_session_encryption_key_32_chars_min!';

  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn(
      '[SECURITY WARNING] SESSION_SECRET is not explicitly configured in production. Using fallback secret.'
    );
  }

  const identityApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.IDENTITY_API_BASE_URL || process.env.CONSUMER_API_BASE_URL,
    UNIFIED_API_PATHS.IDENTITY
  );
  const addressApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.ADDRESS_API_BASE_URL,
    UNIFIED_API_PATHS.ADDRESS
  );
  const orderApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.ORDER_API_BASE_URL,
    UNIFIED_API_PATHS.ORDER
  );
  const paymentApiBaseUrl = resolveUnifiedServiceUrl(
    process.env.PAYMENT_API_BASE_URL,
    UNIFIED_API_PATHS.PAYMENT
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

  const mockAuthApi =
    process.env.MOCK_AUTH_API === 'true'
      ? true
      : process.env.MOCK_AUTH_API === 'false'
      ? false
      : process.env.MOCK_UPSTREAM_API === 'true';

  const mockAddressApi =
    process.env.MOCK_ADDRESS_API === 'true'
      ? true
      : process.env.MOCK_ADDRESS_API === 'false'
      ? false
      : mockAuthApi;

  const mockOrderApi =
    process.env.MOCK_ORDER_API === 'true'
      ? true
      : process.env.MOCK_ORDER_API === 'false'
      ? false
      : mockAuthApi;

  const mockPaymentApi =
    process.env.MOCK_PAYMENT_API === 'true'
      ? true
      : process.env.MOCK_PAYMENT_API === 'false'
      ? false
      : mockAuthApi;

  const identityRsaPadding =
    process.env.IDENTITY_RSA_PADDING?.toLowerCase() === 'oaep' ? 'oaep' : 'pkcs1';

  return {
    identityApiBaseUrl,
    identityClientId,
    identityClientSecret,
    identityRsaPublicKey: process.env.IDENTITY_RSA_PUBLIC_KEY?.trim() || undefined,
    identityRsaPadding,
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
    mapServerApiKey: process.env.MAP_SERVER_API_KEY,
  };
}
