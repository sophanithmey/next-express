import 'server-only';
import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { getServerEnv } from '../config/server-env';
import { SessionData, UserProfile } from '@/features/auth/types/auth-types';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

let cachedKey: Uint8Array | null = null;

async function getEncryptionKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const env = getServerEnv();
  // Derive a fixed 256-bit (32 byte) key from the session secret using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(env.sessionSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  cachedKey = new Uint8Array(hashBuffer);
  return cachedKey;
}

export const sessionService = {
  /**
   * Encrypts and saves session data into an HttpOnly cookie
   */
  async createSession(data: {
    user: UserProfile;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }): Promise<string> {
    const key = await getEncryptionKey();
    const expiresAt = Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 7 * 86400 * 1000);

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

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expiresIn || 7 * 86400,
    });

    return token;
  },

  /**
   * Reads and decrypts the current session from HttpOnly cookie
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      if (!sessionCookie?.value) return null;

      const key = await getEncryptionKey();
      const { payload } = await jwtDecrypt(sessionCookie.value, key);

      const session = payload as unknown as SessionData;
      if (!session || !session.user || !session.accessToken) {
        return null;
      }

      // Check expiration
      if (session.expiresAt && Date.now() > session.expiresAt) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  /**
   * Returns current user without exposing any access token
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  },

  /**
   * Clears the session cookie
   */
  async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  },
};

