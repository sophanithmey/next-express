import 'server-only';
import { serverAxios } from '@/lib/axios/server-axios';
import { toUnifiedUsernamePhone } from '@/lib/phone-number';
import { AuthTokenResponse, UserProfile } from '@/features/auth/types/auth-types';
import { getServerEnv } from '@/server/lib/env';
import { ConsumerApiError } from '@/server/lib/api-response';
import {
  buildUnifiedHeaders,
  handleUnifiedAxiosError,
  unwrapUnifiedAxiosData,
} from '@/server/lib/unified-http';
import { encryptUnifiedPassword } from '@/server/lib/unified-crypto';
import {
  computeExpiresInSeconds,
  decodeJwtPayload,
  extractUnifiedAuthType,
  extractUnifiedErrorMessage,
  extractUnifiedTokenBody,
  mapUnifiedClaimsToProfile,
} from '@/server/lib/unified-jwt';
import {
  ConsumerUserProfileBody,
  mapConsumerUserProfile,
} from './wing-auth-mapper';

export { mapConsumerUserProfile };

async function postIdentityJson<T>(
  path: string,
  data: Record<string, string | null>,
  headers?: Record<string, string>,
): Promise<T> {
  const env = getServerEnv();
  try {
    const response = await serverAxios.request<T>({
      url: `${env.identityApiBaseUrl}${path}`,
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    });
    return unwrapUnifiedAxiosData<T>(response.data, response.status);
  } catch (err: unknown) {
    handleUnifiedAxiosError(
      err,
      'Unable to connect to Unified Authentication Service. Please try again.',
    );
  }
}

export const wingAuthIntegration = {
  async checkPinAuthType(phoneNumber: string): Promise<string> {
    const env = getServerEnv();
    if (!env.identityClientId) {
      throw new ConsumerApiError(
        'Unified Identity client ID is not configured on the server.',
        500,
        'MISSING_CLIENT_CREDENTIALS',
      );
    }

    const rawData = await postIdentityJson<unknown>('/auth/check-type', {
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
        'UNSUPPORTED_AUTH_TYPE',
      );
    }
    return authType;
  },

  async loginWithPin(phoneNumber: string, pin: string): Promise<AuthTokenResponse> {
    const env = getServerEnv();
    await this.checkPinAuthType(phoneNumber);

    if (!env.identityRsaPublicKey) {
      throw new ConsumerApiError(
        'IDENTITY_RSA_PUBLIC_KEY is required on the server to encrypt PINs for Unified /auth/token.',
        500,
        'MISSING_IDENTITY_PUBLIC_KEY',
      );
    }

    const encryptedPin = encryptUnifiedPassword(
      pin,
      env.identityRsaPublicKey,
      env.identityRsaPadding,
    );

    return this.requestToken(
      {
        grant_type: 'PASSWORD',
        client_id: env.identityClientId,
        client_secret: env.identityClientSecret,
        username: toUnifiedUsernamePhone(phoneNumber),
        password: encryptedPin,
      },
      phoneNumber,
    );
  },

  async requestToken(
    body: Record<string, string | null>,
    fallbackPhone: string,
  ): Promise<AuthTokenResponse> {
    const env = getServerEnv();
    if (!env.identityClientId || !env.identityClientSecret) {
      throw new ConsumerApiError(
        'Unified Identity client credentials are not configured on the server.',
        500,
        'MISSING_CLIENT_CREDENTIALS',
      );
    }

    const rawData = await postIdentityJson<unknown>('/auth/token', body);
    const tokenData = extractUnifiedTokenBody(rawData);
    if (!tokenData.accessToken) {
      throw new ConsumerApiError(
        extractUnifiedErrorMessage(rawData, 401),
        401,
        'MISSING_ACCESS_TOKEN',
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
  },

  async refreshToken(refreshToken: string, fallbackPhone = ''): Promise<AuthTokenResponse> {
    const env = getServerEnv();
    return this.requestToken(
      {
        refresh_token: refreshToken,
        username: null,
        password: null,
        grant_type: 'REFRESH_TOKEN',
        client_id: env.identityClientId,
        client_secret: env.identityClientSecret,
      },
      fallbackPhone,
    );
  },

  async revokeSession(accessToken: string): Promise<void> {
    await postIdentityJson<unknown>(
      '/portal/auth/logout',
      { grant_type: 'PASSWORD' },
      { Authorization: `Bearer ${accessToken}` },
    );
  },

  async fetchUserProfile(options: {
    accessToken: string;
    acceptLanguage?: string;
    fallbackPhone?: string;
    fallbackUser?: UserProfile;
  }): Promise<UserProfile> {
    const env = getServerEnv();
    try {
      const response = await serverAxios.request<{ body?: ConsumerUserProfileBody | null }>({
        url: `${env.userApiBaseUrl}/consumer/users/profile`,
        method: 'GET',
        headers: buildUnifiedHeaders({
          accessToken: options.accessToken,
          acceptLanguage: options.acceptLanguage,
        }),
      });
      const rawData = unwrapUnifiedAxiosData<{ body?: ConsumerUserProfileBody | null }>(
        response.data,
        response.status,
      );
      if (!rawData.body || typeof rawData.body !== 'object') {
        throw new ConsumerApiError('User profile response is missing body payload', 502);
      }
      return mapConsumerUserProfile(rawData.body, {
        fallbackPhone: options.fallbackPhone,
        fallbackUser: options.fallbackUser,
      });
    } catch (err: unknown) {
      handleUnifiedAxiosError(
        err,
        'Unable to load user profile from Unified User Service. Please try again.',
      );
    }
  },

  /** Integration boundary for future documented OTP endpoint. */
  async requestOtpBoundary(): Promise<never> {
    throw new ConsumerApiError(
      'Live OTP endpoint integration is not yet configured.',
      501,
      'OTP_INTEGRATION_NOT_CONFIGURED',
    );
  },

  /** Integration boundary for future documented PIN setup endpoint. */
  async setupPinBoundary(): Promise<never> {
    throw new ConsumerApiError(
      'Live PIN setup endpoint integration is not yet configured.',
      501,
      'PIN_SETUP_INTEGRATION_NOT_CONFIGURED',
    );
  },

  /** Integration boundary for future documented PIN reset endpoint. */
  async resetPinBoundary(): Promise<never> {
    throw new ConsumerApiError(
      'Live PIN reset endpoint integration is not yet configured.',
      501,
      'PIN_RESET_INTEGRATION_NOT_CONFIGURED',
    );
  },
};

