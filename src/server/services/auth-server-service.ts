import 'server-only';
import {
  AuthTokenResponse,
  RequestPinPayload,
  RequestPinResponse,
  UserProfile,
  VerifyPinPayload,
} from '@/features/auth/types/auth-types';
import { getServerEnv } from '@/server/lib/env';
import { ConsumerApiError } from '@/server/lib/api-response';
import { sessionService } from '@/server/lib/session';
import { wingAuthIntegration } from '@/server/integrations/wing-auth-integration';

const MOCK_OTP_CODE = '123456';

function buildMockUser(phoneNumber: string): UserProfile {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  return {
    id: `seller-${cleanPhone}`,
    phoneNumber,
    name: 'Express Merchant Store',
    firstName: 'Express',
    lastName: 'Merchant',
    shopName: 'Central Express Boutique',
    role: 'SELLER',
  };
}

export const authServerService = {
  async requestPin(payload: RequestPinPayload): Promise<RequestPinResponse> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      return {
        success: true,
        authType: 'PIN',
        message: 'Ready for 4-digit account PIN verification',
      };
    }

    const authType = await wingAuthIntegration.checkPinAuthType(payload.phoneNumber);
    return {
      success: true,
      authType,
      message: 'Account verified for PIN login',
    };
  },

  async verifyPin(payload: VerifyPinPayload): Promise<AuthTokenResponse> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      await new Promise((res) => setTimeout(res, 250));
      const cleanPhone = payload.phoneNumber.replace(/[^\d+]/g, '');
      return {
        accessToken: `sec_access_${Date.now()}_${cleanPhone}`,
        refreshToken: `sec_refresh_${Date.now()}`,
        expiresIn: 7 * 86400,
        tokenType: 'Bearer',
        user: buildMockUser(payload.phoneNumber),
      };
    }

    return wingAuthIntegration.loginWithPin(payload.phoneNumber, payload.pin);
  },

  async getProfile(
    accessToken: string,
    options?: {
      acceptLanguage?: string;
      fallbackPhone?: string;
      fallbackUser?: UserProfile;
    },
  ): Promise<UserProfile> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      return {
        id: options?.fallbackUser?.id || 'seller-default',
        phoneNumber:
          options?.fallbackUser?.phoneNumber ||
          options?.fallbackPhone ||
          '+855 12 888 999',
        name: options?.fallbackUser?.name || 'Express Merchant Store',
        firstName: 'Express',
        lastName: 'Merchant',
        shopName: options?.fallbackUser?.shopName || 'Central Express Boutique',
        role: options?.fallbackUser?.role || 'SELLER',
      };
    }

    return wingAuthIntegration.fetchUserProfile({
      accessToken,
      acceptLanguage: options?.acceptLanguage,
      fallbackPhone: options?.fallbackPhone,
      fallbackUser: options?.fallbackUser,
    });
  },

  async loginWithPinAndCreateSession(
    payload: VerifyPinPayload,
    acceptLanguage = 'EN',
  ): Promise<UserProfile> {
    const authResult = await this.verifyPin(payload);
    const userProfile = await this.getProfile(authResult.accessToken, {
      acceptLanguage,
      fallbackPhone: payload.phoneNumber,
      fallbackUser: authResult.user,
    });

    await sessionService.createSession({
      user: userProfile,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn,
    });

    return userProfile;
  },

  async getSessionState(options?: {
    refresh?: boolean;
    acceptLanguage?: string;
  }): Promise<{ isAuthenticated: boolean; user: UserProfile | null }> {
    const session = await sessionService.getSession();
    if (!session) {
      return { isAuthenticated: false, user: null };
    }

    if (!options?.refresh) {
      return { isAuthenticated: true, user: session.user };
    }

    try {
      const freshUser = await this.getProfile(session.accessToken, {
        acceptLanguage: options.acceptLanguage,
        fallbackPhone: session.user.phoneNumber,
        fallbackUser: session.user,
      });

      const remainingSeconds = Math.max(
        60,
        Math.floor((session.expiresAt - Date.now()) / 1000),
      );
      await sessionService.createSession({
        user: freshUser,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: remainingSeconds,
      });

      return { isAuthenticated: true, user: freshUser };
    } catch (error: unknown) {
      if (error instanceof ConsumerApiError && error.statusCode === 401) {
        await sessionService.clearSession();
        return { isAuthenticated: false, user: null };
      }
      return { isAuthenticated: true, user: session.user };
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    return sessionService.getCurrentUser();
  },

  async logoutCurrentSession(): Promise<void> {
    const env = getServerEnv();
    try {
      const session = await sessionService.getSession();
      if (!env.mockAuthApi && session?.accessToken) {
        await wingAuthIntegration.revokeSession(session.accessToken);
      }
    } catch {
      // Always proceed to clear local HttpOnly session cookie
    } finally {
      await sessionService.clearSession();
    }
  },

  /** Secure boundary for OTP dispatch & validation (mock mode or live boundary). */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      return {
        success: Boolean(phoneNumber),
        message: 'Verification OTP dispatched (mock mode).',
      };
    }
    return wingAuthIntegration.requestOtpBoundary();
  },

  /** Secure boundary for authenticated 4-digit PIN setup. */
  async setupPin(params: { accessToken: string; newPin: string }): Promise<{ success: boolean; message: string }> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      if (!params.accessToken || params.newPin.length !== 4) {
        throw new ConsumerApiError('Valid session and 4-digit PIN are required.', 400);
      }
      return { success: true, message: 'Account PIN configured (mock mode).' };
    }
    return wingAuthIntegration.setupPinBoundary();
  },

  /** Secure boundary for PIN reset after OTP confirmation. */
  async resetPin(params: { phoneNumber: string; otpCode: string; newPin: string }): Promise<{ success: boolean; message: string }> {
    const env = getServerEnv();
    if (env.mockAuthApi) {
      if (!params.phoneNumber || params.otpCode !== MOCK_OTP_CODE || params.newPin.length !== 4) {
        throw new ConsumerApiError('Invalid OTP or new PIN.', 400);
      }
      return { success: true, message: 'Account PIN updated (mock mode).' };
    }
    return wingAuthIntegration.resetPinBoundary();
  },
};

