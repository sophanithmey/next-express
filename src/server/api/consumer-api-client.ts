import 'server-only';
import { getServerEnv } from '../config/server-env';
import { toUnifiedUsernamePhone } from '@/lib/phone-number';
import {
  AuthTokenResponse,
  RequestPinPayload,
  RequestPinResponse,
  UserProfile,
  VerifyPinPayload,
} from '@/features/auth/types/auth-types';
import { decodeJwtPayload, mapUnifiedClaimsToProfile } from '../auth/unified-jwt';
import { encryptUnifiedPassword } from '../auth/unified-crypto';
import {
  ConsumerApiError,
  checkUnifiedPinAuthType,
  requestUnifiedToken,
  revokeUnifiedSession,
} from '../auth/unified-identity-http';

export { ConsumerApiError };

export const consumerApiClient = {
  /**
   * Checks the consumer's authentication type via `POST /identity/v1/auth/check-type`
   * before prompting for the 4-digit account PIN.
   */
  async requestPin(payload: RequestPinPayload): Promise<RequestPinResponse> {
    const env = getServerEnv();

    if (env.mockAuthApi) {
      return {
        success: true,
        authType: 'PIN',
        message: 'Ready for 4-digit account PIN verification',
      };
    }

    const authType = await checkUnifiedPinAuthType(payload.phoneNumber);
    return {
      success: true,
      authType,
      message: 'Account verified for PIN login',
    };
  },

  /**
   * Checks consumer auth type first, then authenticates using
   * Unified Identity `POST /auth/token` (grant_type: PASSWORD), without WSO2.
   */
  async verifyPin(payload: VerifyPinPayload): Promise<AuthTokenResponse> {
    const env = getServerEnv();
    const unifiedUsername = toUnifiedUsernamePhone(payload.phoneNumber);

    if (env.mockAuthApi) {
      await new Promise((res) => setTimeout(res, 250));
      const cleanPhone = payload.phoneNumber.replace(/[^\d+]/g, '');

      return {
        accessToken: `sec_access_${Date.now()}_${cleanPhone}`,
        refreshToken: `sec_refresh_${Date.now()}`,
        expiresIn: 7 * 86400,
        tokenType: 'Bearer',
        user: {
          id: `seller-${cleanPhone}`,
          phoneNumber: payload.phoneNumber,
          name: 'Express Merchant Store',
          shopName: 'Central Express Boutique',
          role: 'SELLER',
        },
      };
    }

    await checkUnifiedPinAuthType(payload.phoneNumber);

    if (!env.identityRsaPublicKey) {
      throw new ConsumerApiError(
        'IDENTITY_RSA_PUBLIC_KEY is required on the server to encrypt PINs for Unified /auth/token.',
        500,
        'MISSING_IDENTITY_PUBLIC_KEY'
      );
    }

    const encryptedPin = encryptUnifiedPassword(
      payload.pin,
      env.identityRsaPublicKey,
      env.identityRsaPadding
    );

    return requestUnifiedToken(
      {
        grant_type: 'PASSWORD',
        client_id: env.identityClientId,
        client_secret: env.identityClientSecret,
        username: unifiedUsername,
        password: encryptedPin,
      },
      payload.phoneNumber
    );
  },

  /**
   * Refreshes access token via Unified Identity `POST /auth/token` (grant_type: REFRESH_TOKEN).
   */
  async refreshToken(refreshToken: string, fallbackPhone = ''): Promise<AuthTokenResponse> {
    const env = getServerEnv();

    return requestUnifiedToken(
      {
        refresh_token: refreshToken,
        username: null,
        password: null,
        grant_type: 'REFRESH_TOKEN',
        client_id: env.identityClientId,
        client_secret: env.identityClientSecret,
      },
      fallbackPhone
    );
  },

  /**
   * Decodes user profile from the Unified JWT access token (mocked in mockAuthApi mode).
   */
  async getProfile(accessToken: string): Promise<UserProfile> {
    const env = getServerEnv();

    if (env.mockAuthApi) {
      return {
        id: 'seller-default',
        phoneNumber: '+855 12 888 999',
        name: 'Express Merchant Store',
        shopName: 'Central Express Boutique',
        role: 'SELLER',
      };
    }

    const claims = decodeJwtPayload(accessToken);
    if (!claims) {
      throw new ConsumerApiError('Failed to decode user profile from session token', 401);
    }
    return mapUnifiedClaimsToProfile(claims, claims.Mobile || claims.mobile || '');
  },

  /**
   * Calls Unified Identity `POST /portal/auth/logout` with the user's Bearer access token.
   */
  async logout(accessToken?: string): Promise<void> {
    const env = getServerEnv();
    if (env.mockAuthApi || !accessToken) return;
    await revokeUnifiedSession(accessToken);
  },
};
