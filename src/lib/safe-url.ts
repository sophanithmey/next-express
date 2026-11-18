const TRUSTED_PAYMENT_HOSTS = [
  'wingbank.com',
  'wingbank.com.kh',
  'wingmoney.com',
  'wingmall.com',
  'payway.com.kh',
  'aba.com.kh',
  'bakong.nbc.gov.kh',
] as const;

function isTrustedPaymentHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TRUSTED_PAYMENT_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

/**
 * Validates an external payment or card-linking redirect URL.
 * Rejects non-HTTPS schemes (`javascript:`, `data:`, `http:`), embedded credentials,
 * and (when `requireTrustedHost` is enabled for untrusted query parameters) hosts
 * outside the allowlisted Wing / Cambodian payment gateway domains.
 */
export function sanitizePaymentRedirectUrl(
  raw?: string | null,
  options?: { requireTrustedHost?: boolean },
): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;

    if (options?.requireTrustedHost && !isTrustedPaymentHost(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
