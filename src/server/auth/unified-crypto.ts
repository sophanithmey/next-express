import 'server-only';
import { constants, publicEncrypt } from 'node:crypto';

export type IdentityRsaPadding = 'pkcs1' | 'oaep';

/**
 * Normalizes multi-line PEMs, single-line header+body PEMs, escaped `\n` strings,
 * or bare base64 SPKI keys into a canonical 64-char line-wrapped PEM public key.
 */
export function normalizeRsaPublicKeyPem(rawKey: string): string {
  const cleanBase64 = rawKey
    .replace(/\\n/g, '')
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');

  const lines = cleanBase64.match(/.{1,64}/g)?.join('\n') || cleanBase64;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

/**
 * Encrypts a plain password/PIN using the Unified Identity RSA public key,
 * returning the base64 ciphertext string expected by `POST /identity/v1/auth/token`.
 */
export function encryptUnifiedPassword(
  plainPassword: string,
  publicKey: string,
  padding: IdentityRsaPadding = 'pkcs1'
): string {
  const pem = normalizeRsaPublicKeyPem(publicKey);
  const encrypted = publicEncrypt(
    {
      key: pem,
      padding:
        padding === 'oaep'
          ? constants.RSA_PKCS1_OAEP_PADDING
          : constants.RSA_PKCS1_PADDING,
      ...(padding === 'oaep' ? { oaepHash: 'sha256' } : {}),
    },
    Buffer.from(plainPassword, 'utf8')
  );
  return encrypted.toString('base64');
}
