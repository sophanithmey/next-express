import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateKeyPairSync, privateDecrypt, constants } from 'node:crypto';
import { toUnifiedUsernamePhone } from '@/lib/phone-number';
import {
  computeExpiresInSeconds,
  decodeJwtPayload,
  extractUnifiedAuthType,
  extractUnifiedErrorMessage,
  extractUnifiedTokenBody,
  mapUnifiedClaimsToProfile,
} from '@/server/auth/unified-jwt';
import { encryptUnifiedPassword } from '@/server/auth/unified-crypto';
import { consumerApiClient, ConsumerApiError } from '@/server/api/consumer-api-client';

function createTestJwt(claims: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'at+jwt' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${header}.${payload}.signature`;
}

describe('Unified PIN Authentication & Helpers', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('formats Cambodian phone numbers into E.164 +855 format for Unified username', () => {
    expect(toUnifiedUsernamePhone('069 686 234')).toBe('+85569686234');
    expect(toUnifiedUsernamePhone('+85569686234')).toBe('+85569686234');
    expect(toUnifiedUsernamePhone('69686234')).toBe('+85569686234');
    expect(toUnifiedUsernamePhone('85569686234')).toBe('+85569686234');
    expect(toUnifiedUsernamePhone('012 888 999')).toBe('+85512888999');
  });

  it('extracts auth_type and tokens from Unified responses and decodes JWT user claims', () => {
    expect(
      extractUnifiedAuthType({ result: true, result_code: '200', body: { auth_type: 'PIN' } })
    ).toBe('PIN');

    const jwt = createTestJwt({
      sub: '7588d252-4150-4cac-8919-ebf1b041d68a',
      ua_ur_id: 'USR-253420000018495',
      cr_ur_id: '18',
      given_name: 'Sokha',
      family_name: 'Seller',
      Mobile: '+85569686234',
      email: 'sokha@example.com',
      org_name: 'Super',
      aut: 'APPLICATION_USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const tokens = extractUnifiedTokenBody({
      result: true,
      body: {
        access_token: jwt,
        refresh_token: '1d93bf75-67f3-38ac-98ee-ab93877a08e4',
      },
    });

    expect(tokens.accessToken).toBe(jwt);
    expect(tokens.refreshToken).toBe('1d93bf75-67f3-38ac-98ee-ab93877a08e4');

    const claims = decodeJwtPayload(jwt);
    expect(claims?.ua_ur_id).toBe('USR-253420000018495');

    const profile = mapUnifiedClaimsToProfile(claims, '+85569686234');
    expect(profile).toEqual({
      id: 'USR-253420000018495',
      phoneNumber: '+85569686234',
      name: 'Sokha Seller',
      shopName: undefined,
      email: 'sokha@example.com',
      crUrId: '18',
      role: 'APPLICATION_USER',
    });

    const ttl = computeExpiresInSeconds(undefined, claims);
    expect(ttl).toBeGreaterThan(3500);
    expect(ttl).toBeLessThanOrEqual(3600);
  });

  it('extracts result_message and nested errors from Unified error formats', () => {
    expect(
      extractUnifiedErrorMessage(
        { result: false, result_code: 'IDY0002', result_message: 'Incorrect username or password' },
        400
      )
    ).toBe('Incorrect username or password');
    expect(extractUnifiedErrorMessage({ body: { message: 'Invalid PIN' } }, 401)).toBe('Invalid PIN');
    expect(extractUnifiedErrorMessage({}, 401)).toContain('Invalid phone number or PIN');
  });

  it('checks consumer auth type via /auth/check-type in requestPin and rejects non-PIN accounts', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'mv0z8ldFzKat_pr833oMVha3QXIa';
    process.env.MOCK_AUTH_API = 'false';

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          result_code: '200',
          result_message: 'Success',
          body: { auth_type: 'PIN' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          result_code: '200',
          body: { auth_type: 'OTP' },
        }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const okRes = await consumerApiClient.requestPin({ phoneNumber: '078 989 890' });
    expect(okRes).toEqual({
      success: true,
      authType: 'PIN',
      message: 'Account verified for PIN login',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://qa.wingmall.com/identity/v1/auth/check-type');
    expect(JSON.parse(String(init.body))).toEqual({
      client_id: 'mv0z8ldFzKat_pr833oMVha3QXIa',
      username: '+85578989890',
    });

    await expect(
      consumerApiClient.requestPin({ phoneNumber: '+85578989890' })
    ).rejects.toThrowError(ConsumerApiError);
  });

  it('checks /auth/check-type first, RSA-encrypts PIN, and posts PASSWORD grant to /auth/token (not WSO2)', async () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'mv0z8ldFzKat_pr833oMVha3QXIa';
    process.env.IDENTITY_CONSUMER_CLIENT_SECRET = 'encrypted-client-secret';
    process.env.IDENTITY_RSA_PUBLIC_KEY = publicKey;
    process.env.IDENTITY_RSA_PADDING = 'pkcs1';
    process.env.MOCK_AUTH_API = 'false';

    const jwt = createTestJwt({
      ua_ur_id: 'USR-253420000018495',
      cr_ur_id: '18',
      org_name: 'Super',
      exp: Math.floor(Date.now() / 1000) + 1800,
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: true, body: { auth_type: 'PIN' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: true,
          body: {
            access_token: jwt,
            refresh_token: 'ref-token-abc',
          },
        }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await consumerApiClient.verifyPin({
      phoneNumber: '069 686 234',
      pin: '1234',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [checkUrl, checkInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(checkUrl).toBe('https://qa.wingmall.com/identity/v1/auth/check-type');
    expect(JSON.parse(String(checkInit.body))).toEqual({
      client_id: 'mv0z8ldFzKat_pr833oMVha3QXIa',
      username: '+85569686234',
    });

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(tokenUrl).toBe('https://qa.wingmall.com/identity/v1/auth/token');
    expect(tokenInit.method).toBe('POST');

    const sentPayload = JSON.parse(String(tokenInit.body)) as Record<string, string>;
    expect(sentPayload.grant_type).toBe('PASSWORD');
    expect(sentPayload.client_id).toBe('mv0z8ldFzKat_pr833oMVha3QXIa');
    expect(sentPayload.client_secret).toBe('encrypted-client-secret');
    expect(sentPayload.username).toBe('+85569686234');
    expect(sentPayload.password).not.toBe('1234');

    const decryptedPin = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
      Buffer.from(sentPayload.password, 'base64')
    ).toString('utf8');
    expect(decryptedPin).toBe('1234');

    expect(result.accessToken).toBe(jwt);
    expect(result.refreshToken).toBe('ref-token-abc');
    expect(result.user?.id).toBe('USR-253420000018495');
    expect(result.user?.phoneNumber).toBe('069 686 234');
  });

  it('supports bare base64 SPKI public keys for PIN encryption', () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const bareBase64 = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s+/g, '');

    const ciphertext = encryptUnifiedPassword('5678', bareBase64, 'pkcs1');
    const decrypted = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
      Buffer.from(ciphertext, 'base64')
    ).toString('utf8');
    expect(decrypted).toBe('5678');

    const singleLinePem = `-----BEGIN PUBLIC KEY-----${bareBase64}-----END PUBLIC KEY-----`;
    const singleLineCipher = encryptUnifiedPassword('9012', singleLinePem, 'pkcs1');
    const singleLineDecrypted = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
      Buffer.from(singleLineCipher, 'base64')
    ).toString('utf8');
    expect(singleLineDecrypted).toBe('9012');
  });

  it('propagates result_message when Unified /auth/token rejects credentials', async () => {
    const { publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    process.env.IDENTITY_CONSUMER_CLIENT_ID = 'mv0z8ldFzKat_pr833oMVha3QXIa';
    process.env.IDENTITY_CONSUMER_CLIENT_SECRET = 'encrypted-client-secret';
    process.env.IDENTITY_RSA_PUBLIC_KEY = publicKey;
    process.env.MOCK_AUTH_API = 'false';

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: true, body: { auth_type: 'PIN' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          result: false,
          result_code: 'IDY0002',
          result_message: 'Incorrect username or password',
        }),
      }) as unknown as typeof fetch;

    await expect(
      consumerApiClient.verifyPin({ phoneNumber: '069686234', pin: '0000' })
    ).rejects.toThrowError(ConsumerApiError);
  });

  it('calls /identity/v1/portal/auth/logout with Bearer accessToken and PASSWORD grant_type on logout', async () => {
    process.env.BASE_URL_UNIFIED = 'https://qa.wingmall.com';
    process.env.MOCK_AUTH_API = 'false';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ result: true, result_code: '200', result_message: 'Success' }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await consumerApiClient.logout('jwt-access-token-123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://qa.wingmall.com/identity/v1/portal/auth/logout');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer jwt-access-token-123'
    );
    expect(JSON.parse(String(init.body))).toEqual({ grant_type: 'PASSWORD' });
  });
});
