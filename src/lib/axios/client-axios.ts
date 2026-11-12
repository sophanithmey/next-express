import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface ErrorResponseBody {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Normalizes a UI locale (`en`, `km`) to Wing BFF `Accept-Language` (`EN`, `KM`).
 */
export function normalizeAcceptLanguage(locale?: string): string {
  const normalized = (locale || 'EN').slice(0, 2).toUpperCase();
  return normalized === 'KM' || normalized === 'ZH' || normalized === 'EN'
    ? normalized
    : 'EN';
}

/**
 * Returns Axios request config with normalized `Accept-Language` header.
 */
export function withAcceptLanguage(
  locale?: string,
  config?: AxiosRequestConfig,
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config?.headers,
      'Accept-Language': normalizeAcceptLanguage(locale),
    },
  };
}

/**
 * Shared frontend Axios instance talking strictly to internal Next.js BFF (`/api`).
 * Never holds or forwards external API credentials.
 */
export const clientAxios = axios.create({
  baseURL: '/api',
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

clientAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 503;
      const body = error.response?.data as ErrorResponseBody | undefined;
      const fallback =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Unable to reach service. Please try again.';
      const message =
        typeof body?.message === 'string' && body.message.trim().length > 0
          ? body.message
          : fallback;

      return Promise.reject(
        new ApiClientError(message, status, body?.code, body?.details),
      );
    }

    return Promise.reject(
      new ApiClientError('Unexpected request failure. Please try again.', 500),
    );
  },
);
