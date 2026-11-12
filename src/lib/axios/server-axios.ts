import 'server-only';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getServerEnv } from '@/server/lib/env';

function scrubSensitiveConfig(config?: InternalAxiosRequestConfig): void {
  if (!config) return;
  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
    delete config.headers.cookie;
    delete config.headers.Cookie;
  }
  if (config.data && typeof config.data === 'object' && !Array.isArray(config.data)) {
    const record = config.data as Record<string, unknown>;
    if ('client_secret' in record) record.client_secret = '[REDACTED]';
    if ('password' in record) record.password = '[REDACTED]';
    if ('refresh_token' in record) record.refresh_token = '[REDACTED]';
  }
}

/**
 * Shared server-only Axios instance configured with `WING_EXPRESS_API_URL`
 * for all external WingExpress and Wing Unified backend API integrations.
 */
export const serverAxios = axios.create({
  baseURL: process.env.WING_EXPRESS_API_URL || process.env.BASE_URL_UNIFIED || 'https://qa.wingmall.com',
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
});

serverAxios.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getServerEnv().wingExpressApiUrl;
  }
  return config;
});

serverAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      scrubSensitiveConfig(error.config);
    }
    return Promise.reject(error);
  },
);

