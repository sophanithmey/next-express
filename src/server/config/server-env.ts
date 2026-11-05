import 'server-only';

export interface ServerEnvConfig {
  consumerApiBaseUrl: string;
  consumerClientId: string;
  expressApiBaseUrl: string;
  sessionSecret: string;
  mockUpstreamApi: boolean;
  mapServerApiKey?: string;
}

export function getServerEnv(): ServerEnvConfig {
  const sessionSecret =
    process.env.SESSION_SECRET || 'express_seller_secure_jwt_session_encryption_key_32_chars_min!';

  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn(
      '[SECURITY WARNING] SESSION_SECRET is not explicitly configured in production. Using fallback secret.'
    );
  }

  return {
    consumerApiBaseUrl:
      process.env.CONSUMER_API_BASE_URL || 'https://stage-api.wingbank.com/identity/v1',
    consumerClientId: process.env.CONSUMER_CLIENT_ID || 'express-seller-web',
    expressApiBaseUrl:
      process.env.EXPRESS_API_BASE_URL || 'https://stage-api.wingbank.com/delivery/v1',
    sessionSecret,
    mockUpstreamApi:
      process.env.MOCK_UPSTREAM_API === 'true' ||
      !process.env.CONSUMER_API_BASE_URL ||
      process.env.CONSUMER_API_BASE_URL.includes('stage-api.wingbank.com'),
    mapServerApiKey: process.env.MAP_SERVER_API_KEY,
  };
}

