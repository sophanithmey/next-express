import { clientAxios, withAcceptLanguage } from '@/lib/axios/client-axios';
import {
  RequestPinPayload,
  RequestPinResponse,
  UserProfile,
  VerifyPinPayload,
} from '../types/auth-types';

export interface SessionStateResponse {
  isAuthenticated: boolean;
  user: UserProfile | null;
  expiresAt?: number;
}

export interface VerifyPinResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface PinActionResponse {
  success: boolean;
  message?: string;
}

export const authApiService = {
  async getSession(options?: {
    refresh?: boolean;
    locale?: string;
  }): Promise<SessionStateResponse> {
    const response = await clientAxios.get<SessionStateResponse>(
      '/auth/session',
      withAcceptLanguage(options?.locale, {
        params: options?.refresh ? { refresh: 'true' } : undefined,
      }),
    );
    return response.data;
  },

  async requestPin(
    payload: RequestPinPayload,
    locale?: string,
  ): Promise<RequestPinResponse> {
    const response = await clientAxios.post<RequestPinResponse>(
      '/auth/request-pin',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async verifyPin(
    payload: VerifyPinPayload,
    locale?: string,
  ): Promise<VerifyPinResponse> {
    const response = await clientAxios.post<VerifyPinResponse>(
      '/auth/verify-pin',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async logout(): Promise<PinActionResponse> {
    const response = await clientAxios.post<PinActionResponse>('/auth/logout');
    return response.data;
  },

  async setupPin(payload: { newPin: string }, locale?: string): Promise<PinActionResponse> {
    const response = await clientAxios.post<PinActionResponse>(
      '/auth/pin/setup',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async resetPin(
    payload: { phoneNumber: string; otpCode: string; newPin: string },
    locale?: string,
  ): Promise<PinActionResponse> {
    const response = await clientAxios.post<PinActionResponse>(
      '/auth/pin/reset',
      payload,
      withAcceptLanguage(locale),
    );
    return response.data;
  },
};

