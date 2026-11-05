import { describe, it, expect } from 'vitest';
import { EncryptJWT, jwtDecrypt } from 'jose';

describe('Encrypted Session Token Service (JWE AES-256-GCM)', () => {
  it('successfully encrypts and decrypts session data without leaking token plaintext', async () => {
    const encoder = new TextEncoder();
    const secret = 'express_seller_secure_jwt_session_encryption_key_32_chars_min!';
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
    const key = new Uint8Array(hash);

    const sessionPayload = {
      user: {
        id: 'seller-012888999',
        phoneNumber: '012 888 999',
        name: 'Express Merchant Store',
        role: 'SELLER',
      },
      accessToken: 'upstream_secret_token_12345',
      expiresAt: Date.now() + 3600000,
    };

    // Encrypt into JWE (compact serialization)
    const encryptedToken = await new EncryptJWT({ ...sessionPayload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .encrypt(key);

    expect(encryptedToken).toBeDefined();
    expect(typeof encryptedToken).toBe('string');
    // Ensure the raw access token is nowhere in the ciphertext string
    expect(encryptedToken.includes('upstream_secret_token_12345')).toBe(false);

    // Decrypt
    const { payload } = await jwtDecrypt(encryptedToken, key);
    expect(payload.user).toEqual(sessionPayload.user);
    expect(payload.accessToken).toBe('upstream_secret_token_12345');
  });
});

