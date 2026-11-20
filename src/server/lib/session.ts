import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { DEFAULT_DEV_SESSION_SECRET, getServerEnv } from './env';
import { SessionData, UserProfile } from '@/features/auth/types/auth-types';
import { HAS_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/constants';

let cachedKey: Uint8Array | null = null;
let cachedSecretValue: string | null = null;

async function getEncryptionKey(): Promise<Uint8Array> {
  const env = getServerEnv();
  if (
    process.env.NODE_ENV === 'production' &&
    !env.mockAuthApi &&
    (!process.env.SESSION_SECRET?.trim() ||
      env.sessionSecret === DEFAULT_DEV_SESSION_SECRET ||
      env.sessionSecret.length < 32)
  ) {
    throw new Error(
      'A strong SESSION_SECRET (at least 32 characters) is required in production.',
    );
  }

  if (cachedKey && cachedSecretValue === env.sessionSecret) return cachedKey;
  const encoder = new TextEncoder();
  const data = encoder.encode(env.sessionSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  cachedKey = new Uint8Array(hashBuffer);
  cachedSecretValue = env.sessionSecret;
  return cachedKey;
}

function isSecureCookieContext(): boolean {
  if (process.env.SESSION_SECURE_COOKIE === 'false') return false;
  if (process.env.SESSION_SECURE_COOKIE === 'true') return true;
  if (process.env.NODE_ENV !== 'production') return false;
  // If deployed on Vercel or explicitly configured with an HTTPS URL, use Secure cookies
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
    return true;
  }
  // Allow local production testing on http://localhost without browsers dropping insecure cookies
  return false;
}

export const sessionService = {
  /**
   * Encrypts and saves session data into an HttpOnly cookie.
   */
  async createSession(data: {
    user: UserProfile;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }): Promise<string> {
    const key = await getEncryptionKey();
    const expiresAt =
      Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 7 * 86400 * 1000);

    const sessionPayload: SessionData = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt,
    };

    const token = await new EncryptJWT({ ...sessionPayload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt / 1000))
      .encrypt(key);

    const isSecure = isSecureCookieContext();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: data.expiresIn || 7 * 86400,
    });
    cookieStore.set(HAS_SESSION_COOKIE_NAME, '1', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: data.expiresIn || 7 * 86400,
    });

    return token;
  },

  /**
   * Reads and decrypts the current session from HttpOnly cookie.
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      if (!sessionCookie?.value) return null;

      const key = await getEncryptionKey();
      const { payload } = await jwtDecrypt(sessionCookie.value, key, {
        keyManagementAlgorithms: ['dir'],
        contentEncryptionAlgorithms: ['A256GCM'],
      });

      const session = payload as unknown as SessionData;
      if (!session || !session.user || !session.accessToken) {
        return null;
      }

      if (session.expiresAt && Date.now() > session.expiresAt) {
        try {
          await this.clearSession();
        } catch {
          // Cookie deletion is only permitted in Route Handlers / Server Actions
        }
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  /**
   * Returns current user without exposing any access token.
   * Cached at request-level via React cache() to prevent redundant JWT decryption in RSC.
   */
  getCurrentUser: cache(async function (): Promise<UserProfile | null> {
    const session = await sessionService.getSession();
    return session ? session.user : null;
  }),

  /**
   * Clears the encrypted session cookie.
   */
  async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(HAS_SESSION_COOKIE_NAME);
  },
};
