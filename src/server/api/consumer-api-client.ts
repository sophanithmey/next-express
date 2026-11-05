import 'server-only';
import { getServerEnv } from '../config/server-env';
import {
  AuthTokenResponse,
  RequestPinPayload,
  RequestPinResponse,
  UserProfile,
  VerifyPinPayload,
} from '@/features/auth/types/auth-types';

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

export const consumerApiClient = {
  /**
   * Request PIN from the upstream Consumer App Identity API
   */
  async requestPin(payload: RequestPinPayload): Promise<RequestPinResponse> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      // Simulate fast network response
      await new Promise((res) => setTimeout(res, 350));
      return {
        success: true,
        message: 'PIN sent to your phone number',
        expireInSeconds: 120,
        otpRef: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }

    try {
      const response = await fetch(`${env.consumerApiBaseUrl}/pin/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: payload.phoneNumber,
          clientId: env.consumerClientId,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ConsumerApiError(
          errorData.message || 'Failed to request PIN from Consumer Identity Service',
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError) throw err;
      throw new ConsumerApiError(
        'Unable to connect to Consumer Authentication Service. Please try again.',
        503
      );
    }
  },

  /**
   * Verify PIN against Consumer App Identity API
   */
  async verifyPin(payload: VerifyPinPayload): Promise<AuthTokenResponse> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      await new Promise((res) => setTimeout(res, 400));
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

    try {
      const response = await fetch(`${env.consumerApiBaseUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          grantType: 'pin',
          clientId: env.consumerClientId,
          username: payload.phoneNumber,
          password: payload.pin,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ConsumerApiError(
          errorData.message || 'Invalid PIN code. Please verify and try again.',
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError) throw err;
      throw new ConsumerApiError(
        'Authentication verification service unreachable. Please try again.',
        503
      );
    }
  },

  /**
   * Get authenticated user profile
   */
  async getProfile(accessToken: string): Promise<UserProfile> {
    const env = getServerEnv();

    if (env.mockUpstreamApi) {
      return {
        id: 'seller-default',
        phoneNumber: '+855 12 888 999',
        name: 'Express Merchant Store',
        shopName: 'Central Express Boutique',
        role: 'SELLER',
      };
    }

    try {
      const response = await fetch(`${env.consumerApiBaseUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new ConsumerApiError('Failed to load profile', response.status);
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof ConsumerApiError) throw err;
      throw new ConsumerApiError('Failed to fetch user profile', 500);
    }
  },
};
