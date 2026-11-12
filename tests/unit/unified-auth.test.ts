import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { serverAxios } from '@/lib/axios/server-axios';
import { toUnifiedUsernamePhone } from '@/lib/phone-number';
import {
  computeExpiresInSeconds,
  decodeJwtPayload,
  extractUnifiedTokenBody,
  mapUnifiedClaimsToProfile,
} from '@/server/lib/unified-jwt';
import { encryptUnifiedPassword } from '@/server/lib/unified-crypto';
import { ConsumerApiError } from '@/server/lib/api-response';
import { sessionService } from '@/server/lib/session';
import {
  mapConsumerUserProfile,
  wingAuthIntegration,
} from '@/server/integrations/wing-auth-integration';
import { authServerService } from '@/server/services/auth-server-service';
import { POST as verifyPinPost } from '@/app/api/auth/verify-pin/route';

function makeAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function makeFakeJwt(claims: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${header}.${payload}.fake-signature`;
}

describe('Wing Unified Auth Integration & BFF Security', () => {
  const envBackup = { ...process.env };
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 1024,
  });
  const testPubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.WING_EXPRESS_API_URL = 'https://qa.wingmall.com';
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('normalizes phone numbers to Unified E.164 username format and decodes JWT claims', () => {
    expect(toUnifiedUsernamePhone('078 989 890')).toBe('+85578989890');
    expect(toUnifiedUsernamePhone('+855 12 888 999')).toBe('+85512888999');

    const token = makeFakeJwt({
      ua_ur_id: 'USR-123',
      cr_ur_id: 'USR-123',
      Mobile: '+85578989890',
      given_name: 'Sophea',
      family_name: 'Chan',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const claims = decodeJwtPayload(token);
    const profile = mapUnifiedClaimsToProfile(claims, '078989890');
    expect(profile.id).toBe('USR-123');
    expect(profile.phoneNumber).toBe('+85578989890');
    expect(profile.name).toBe('Sophea Chan');
    expect(computeExpiresInSeconds(undefined, claims)).toBeGreaterThan(3000);
    expect(extractUnifiedTokenBody({ body: { access_token: token } }).accessToken).toBe(
      token,
    );
  });

  it('RSA encrypts passwords and decrypts cleanly with matching private key', () => {
    const encryptedOaep = encryptUnifiedPassword('1234', testPubPem, 'oaep');
    const decryptedOaep = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedOaep, 'base64'),
    );
    expect(decryptedOaep.toString('utf8')).toBe('1234');

    const encryptedPkcs1 = encryptUnifiedPassword('5678', testPubPem, 'pkcs1');
    const decryptedPkcs1 = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(encryptedPkcs1, 'base64'),
    );
    expect(decryptedPkcs1.toString('utf8')).toBe('5678');
  });

  it('checks /auth/check-type via authServerService.requestPin and rejects non-PIN accounts', async () => {
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'mv0z8ldFzKat_pr833oMVha3QXIa';
    process.env.MOCK_AUTH_API = 'false';

    const requestSpy = vi
      .spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          result_code: '200',
          result_message: 'Success',
          body: { auth_type: 'PIN' },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          result_code: '200',
          body: { auth_type: 'OTP' },
        }),
      );

    const okRes = await authServerService.requestPin({ phoneNumber: '078 989 890' });
    expect(okRes).toEqual({
      success: true,
      authType: 'PIN',
      message: 'Account verified for PIN login',
    });

    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      url: 'https://qa.wingmall.com/identity/v1/auth/check-type',
      method: 'POST',
      data: {
        client_id: 'mv0z8ldFzKat_pr833oMVha3QXIa',
        username: '+85578989890',
      },
    });

    await expect(
      authServerService.requestPin({ phoneNumber: '+85578989890' }),
    ).rejects.toThrowError(ConsumerApiError);
  });

  it('checks /auth/check-type first, RSA-encrypts PIN, and posts PASSWORD grant to /auth/token', async () => {
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'client-id-1';
    process.env.IDENTITY_CONSUMER_CLIENT_SECRET = 'client-secret-1';
    process.env.IDENTITY_RSA_PUBLIC_KEY = testPubPem;
    process.env.IDENTITY_RSA_PADDING = 'pkcs1';
    process.env.MOCK_AUTH_API = 'false';

    const fakeJwt = makeFakeJwt({
      ua_ur_id: 'USR-999',
      cr_ur_id: 'USR-999',
      Mobile: '+85578989890',
      name: 'Live Express Seller',
      exp: Math.floor(Date.now() / 1000) + 1800,
    });

    const requestSpy = vi
      .spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({ result: true, body: { auth_type: 'PIN' } }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            access_token: fakeJwt,
            refresh_token: 'ref-tok-1',
            token_type: 'Bearer',
            expires_in: 1800,
          },
        }),
      );

    const result = await wingAuthIntegration.loginWithPin('078989890', '4321');
    expect(result.accessToken).toBe(fakeJwt);
    expect(result.refreshToken).toBe('ref-tok-1');
    expect(result.user?.id).toBe('USR-999');

    const tokenConfig = requestSpy.mock.calls[1][0];
    expect(tokenConfig.url).toBe('https://qa.wingmall.com/identity/v1/auth/token');
    const tokenBody = tokenConfig.data as Record<string, string>;
    expect(tokenBody.grant_type).toBe('PASSWORD');
    expect(tokenBody.client_id).toBe('client-id-1');
    expect(tokenBody.client_secret).toBe('client-secret-1');
    expect(tokenBody.username).toBe('+85578989890');
    expect(tokenBody.password).not.toBe('4321');
  });

  it('fetches GET /user/v1/consumer/users/profile and maps consumer profile fields', async () => {
    const requestSpy = vi.spyOn(serverAxios, 'request').mockResolvedValueOnce(
      makeAxiosResponse({
        result: true,
        result_code: '200',
        body: {
          id: 'USR-CON-01',
          phone_number: '+85512888999',
          email: 'seller@wing.com',
          first_name: 'Dara',
          last_name: 'Sok',
        },
      }),
    );

    const profile = await wingAuthIntegration.fetchUserProfile({
      accessToken: 'tok-live',
      acceptLanguage: 'KM',
      fallbackPhone: '012888999',
    });

    const config = requestSpy.mock.calls[0][0];
    expect(config.url).toBe('https://qa.wingmall.com/user/v1/consumer/users/profile');
    expect(config.method).toBe('GET');
    expect((config.headers as Record<string, string>)['accept-language']).toBe('KM');
    expect(profile).toMatchObject({
      id: 'USR-CON-01',
      phoneNumber: '+85512888999',
      email: 'seller@wing.com',
      firstName: 'Dara',
      lastName: 'Sok',
      name: 'Dara Sok',
    });

    const fallbackProfile = mapConsumerUserProfile(
      { id: null, phone_number: '' },
      { fallbackPhone: '012333444' },
    );
    expect(fallbackProfile.phoneNumber).toBe('012333444');
  });

  it('persists session cookie on POST /api/auth/verify-pin using fetched consumer profile', async () => {
    process.env.MOCK_AUTH_API = 'false';
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'client-1';
    process.env.IDENTITY_CONSUMER_CLIENT_SECRET = 'secret-1';
    process.env.IDENTITY_RSA_PUBLIC_KEY = testPubPem;
    process.env.IDENTITY_RSA_PADDING = 'pkcs1';

    const fakeJwt = makeFakeJwt({
      cr_ur_id: 'USR-JWT-1',
      preferred_username: '+85512888999',
      exp: Math.floor(Date.now() / 1000) + 1800,
    });

    vi.spyOn(serverAxios, 'request')
      .mockResolvedValueOnce(
        makeAxiosResponse({ result: true, body: { auth_type: 'PIN' } }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: { access_token: fakeJwt, refresh_token: 'ref-1', expires_in: 1800 },
        }),
      )
      .mockResolvedValueOnce(
        makeAxiosResponse({
          result: true,
          body: {
            id: 'USR-CON-99',
            phone_number: '+85512888999',
            first_name: 'Nita',
            last_name: 'Keo',
          },
        }),
      );

    const createSessionSpy = vi
      .spyOn(sessionService, 'createSession')
      .mockResolvedValue('mock-jwe-cookie');

    const req = new Request('http://localhost:3000/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'EN' },
      body: JSON.stringify({ phoneNumber: '012888999', pin: '1234' }),
    });

    const res = await verifyPinPost(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      user: { id: string; name: string };
    };
    expect(json.success).toBe(true);
    expect(json.user.id).toBe('USR-CON-99');
    expect(json.user.name).toBe('Nita Keo');
    expect(createSessionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: fakeJwt,
        refreshToken: 'ref-1',
        user: expect.objectContaining({ id: 'USR-CON-99', name: 'Nita Keo' }),
      }),
    );
  });
});
