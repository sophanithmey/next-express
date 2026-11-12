import 'server-only';
import { UserProfile } from '@/features/auth/types/auth-types';

export interface UnifiedJwtClaims {
  sub?: string;
  ua_ur_id?: string;
  cr_ur_id?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  Mobile?: string;
  mobile?: string;
  email?: string;
  org_id?: string;
  org_name?: string;
  aut?: string;
  exp?: number;
  iat?: number;
  unified_services?: string;
}

export interface ExtractedUnifiedTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(
  obj: Record<string, unknown> | null,
  key: string,
): string | undefined {
  const val = obj?.[key];
  return typeof val === 'string' && val.trim().length > 0 ? val : undefined;
}

function readNumber(
  obj: Record<string, unknown> | null,
  key: string,
): number | undefined {
  const val = obj?.[key];
  return typeof val === 'number' && Number.isFinite(val) ? val : undefined;
}

/**
 * Decodes the payload segment of a JWT access token without verifying signature
 * (tokens are received directly over TLS from the trusted Unified Identity BFF call).
 */
export function decodeJwtPayload(token: string): UnifiedJwtClaims | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    return asRecord(parsed) as UnifiedJwtClaims | null;
  } catch {
    return null;
  }
}

/**
 * Extracts access/refresh tokens from Unified Identity responses
 * (`response.body.access_token` or top-level `access_token` / `accessToken`).
 */
export function extractUnifiedTokenBody(raw: unknown): ExtractedUnifiedTokens {
  const root = asRecord(raw);
  const nestedBody = asRecord(root?.body) || asRecord(root?.data);
  const source = nestedBody || root;

  return {
    accessToken:
      readString(source, 'access_token') ||
      readString(source, 'accessToken') ||
      readString(root, 'access_token') ||
      readString(root, 'accessToken'),
    refreshToken:
      readString(source, 'refresh_token') ||
      readString(source, 'refreshToken') ||
      readString(root, 'refresh_token') ||
      readString(root, 'refreshToken'),
    expiresIn:
      readNumber(source, 'expires_in') ??
      readNumber(source, 'expiresIn') ??
      readNumber(root, 'expires_in') ??
      readNumber(root, 'expiresIn'),
    tokenType:
      readString(source, 'token_type') ||
      readString(source, 'tokenType') ||
      readString(root, 'token_type'),
  };
}

/**
 * Extracts `auth_type` from `POST /identity/v1/auth/check-type` response (`body.auth_type`).
 */
export function extractUnifiedAuthType(raw: unknown): string | undefined {
  const root = asRecord(raw);
  const body = asRecord(root?.body);
  return readString(body, 'auth_type') || readString(root, 'auth_type');
}

/**
 * Returns true if the Unified Identity response explicitly indicates a failure (`result === false`).
 */
export function isUnifiedFailureResponse(raw: unknown): boolean {
  const root = asRecord(raw);
  return root?.result === false;
}

/**
 * Extracts a human-readable error message from varied Unified Identity error payloads.
 */
export function extractUnifiedErrorMessage(
  raw: unknown,
  statusCode: number,
): string {
  const root = asRecord(raw);
  const body = asRecord(root?.body);
  const header = asRecord(root?.header);
  const status = asRecord(root?.status);

  return (
    readString(body, 'message') ||
    readString(root, 'result_message') ||
    readString(header, 'responseMessage') ||
    readString(header, 'message') ||
    readString(status, 'message') ||
    readString(root, 'error_description') ||
    readString(root, 'message') ||
    readString(root, 'error') ||
    (statusCode === 401
      ? 'Invalid phone number or PIN. Please check and try again.'
      : 'Authentication failed. Please try again.')
  );
}

/**
 * Maps decoded Unified JWT claims into the application's UserProfile contract.
 */
export function mapUnifiedClaimsToProfile(
  claims: UnifiedJwtClaims | null,
  fallbackPhone: string,
): UserProfile {
  const fullName = [claims?.given_name, claims?.family_name]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .trim();
  const resolvedName = fullName || claims?.name?.trim() || '--';
  const cleanDigits = fallbackPhone.replace(/[^\d]/g, '');
  const orgName = claims?.org_name?.trim();
  const shopName = orgName && orgName !== 'Super' ? orgName : undefined;

  return {
    id: claims?.ua_ur_id || claims?.sub || `seller-${cleanDigits}`,
    phoneNumber: claims?.Mobile || claims?.mobile || fallbackPhone,
    name: resolvedName,
    shopName,
    email: claims?.email?.trim() || undefined,
    crUrId: claims?.cr_ur_id?.trim() || undefined,
    role: claims?.aut || 'SELLER',
  };
}

/**
 * Computes remaining session TTL in seconds from response `expires_in` or JWT `exp` claim.
 */
export function computeExpiresInSeconds(
  explicitExpiresIn: number | undefined,
  claims: UnifiedJwtClaims | null,
  nowMs: number = Date.now(),
): number | undefined {
  if (typeof explicitExpiresIn === 'number' && explicitExpiresIn > 0) {
    return Math.floor(explicitExpiresIn);
  }
  if (typeof claims?.exp === 'number' && Number.isFinite(claims.exp)) {
    const remaining = Math.floor(claims.exp - nowMs / 1000);
    return Math.max(60, remaining);
  }
  return undefined;
}

