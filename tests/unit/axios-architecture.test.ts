import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import {
  ApiClientError,
  clientAxios,
  normalizeAcceptLanguage,
} from '@/lib/axios/client-axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { makeQueryClient } from '@/lib/query/query-client';
import { sessionService } from '@/server/lib/session';
import { POST as setupPinPost } from '@/app/api/auth/pin/setup/route';
import { POST as resetPinPost } from '@/app/api/auth/pin/reset/route';

describe('Axios Architecture, TanStack Query & Auth Boundaries', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('configures clientAxios strictly against internal /api without external secrets', () => {
    expect(clientAxios.defaults.baseURL).toBe('/api');
    expect(clientAxios.defaults.withCredentials).toBe(true);
    expect(normalizeAcceptLanguage('km')).toBe('KM');
    expect(normalizeAcceptLanguage('en')).toBe('EN');
    expect(normalizeAcceptLanguage(undefined)).toBe('EN');
  });

  it('normalizes Axios errors into ApiClientError on clientAxios response interceptor', async () => {
    const adapterSpy = vi.fn().mockRejectedValueOnce(
      new AxiosError(
        'Request failed with status code 422',
        'ERR_BAD_REQUEST',
        { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
        undefined,
        {
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: {},
          config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
          data: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
        },
      ),
    );

    const originalAdapter = clientAxios.defaults.adapter;
    clientAxios.defaults.adapter = adapterSpy;
    try {
      await expect(clientAxios.get('/bookings')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Validation failed',
        statusCode: 422,
        code: 'VALIDATION_ERROR',
      });
    } finally {
      clientAxios.defaults.adapter = originalAdapter;
    }

    const sampleErr = new ApiClientError('Denied', 403, 'FORBIDDEN');
    expect(sampleErr).toBeInstanceOf(Error);
    expect(sampleErr.statusCode).toBe(403);
  });

  it('scrubs sensitive credentials from failed serverAxios request configs', async () => {
    const config: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders({
        Authorization: 'Bearer secret-token',
        Cookie: 'session=secret',
      }),
      data: {
        client_secret: 'my-secret',
        password: 'encrypted-pin',
        refresh_token: 'my-refresh',
        username: '+85512888999',
      },
    };

    const originalAdapter = serverAxios.defaults.adapter;
    serverAxios.defaults.adapter = async () => {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { result: false, result_message: 'Invalid PIN' },
      });
    };

    try {
      await serverAxios.request({ url: '/identity/v1/auth/token', method: 'POST', ...config });
      expect.fail('Expected serverAxios request to reject');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError;
      expect(axiosErr.config?.headers.Authorization).toBeUndefined();
      expect(axiosErr.config?.headers.Cookie).toBeUndefined();
      expect(axiosErr.config?.data).toEqual({
        client_secret: '[REDACTED]',
        password: '[REDACTED]',
        refresh_token: '[REDACTED]',
        username: '+85512888999',
      });
    } finally {
      serverAxios.defaults.adapter = originalAdapter;
    }
  });

  it('creates isolated QueryClient instances with sensible default options', () => {
    const qc1 = makeQueryClient();
    const qc2 = makeQueryClient();
    expect(qc1).not.toBe(qc2);
    expect(qc1.getDefaultOptions().queries?.staleTime).toBe(30_000);
    expect(qc1.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    expect(qc1.getDefaultOptions().mutations?.retry).toBe(0);
  });

  it('enforces session and validation on PIN setup/reset boundaries', async () => {
    vi.spyOn(sessionService, 'getSession').mockResolvedValueOnce(null);
    const unauthReq = new Request('http://localhost:3000/api/auth/pin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPin: '1234' }),
    });
    const unauthRes = await setupPinPost(unauthReq);
    expect(unauthRes.status).toBe(401);

    process.env.MOCK_AUTH_API = 'true';
    vi.spyOn(sessionService, 'getSession').mockResolvedValueOnce({
      user: { id: 'U1', name: 'Seller', phoneNumber: '012888999' },
      accessToken: 'tok-1',
      expiresAt: Date.now() + 60_000,
    });
    const mockSetupRes = await setupPinPost(
      new Request('http://localhost:3000/api/auth/pin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: '1234' }),
      }),
    );
    expect(mockSetupRes.status).toBe(200);

    process.env.MOCK_AUTH_API = 'false';
    vi.spyOn(sessionService, 'getSession').mockResolvedValueOnce({
      user: { id: 'U1', name: 'Seller', phoneNumber: '012888999' },
      accessToken: 'tok-1',
      expiresAt: Date.now() + 60_000,
    });
    const liveSetupRes = await setupPinPost(
      new Request('http://localhost:3000/api/auth/pin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: '1234' }),
      }),
    );
    expect(liveSetupRes.status).toBe(501);

    const liveResetRes = await resetPinPost(
      new Request('http://localhost:3000/api/auth/pin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '012888999',
          otpCode: '123456',
          newPin: '4321',
        }),
      }),
    );
    expect(liveResetRes.status).toBe(501);
  });
});

