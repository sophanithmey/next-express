const ABSOLUTE_URL_PATTERN = /^(https?:|data:|blob:)/i;

/**
 * Resolves a relative media path from Wing APIs against `NEXT_PUBLIC_IMAGE_CDN_BASE`.
 */
export function fullImageUrl(
  path?: string | null,
  baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_BASE,
): string {
  const trimmed = path?.trim();
  if (!trimmed) return '';

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const cleanBase = baseUrl?.trim().replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');

  if (cleanBase) {
    return `${cleanBase}/${cleanPath}`;
  }

  return trimmed.startsWith('/') ? trimmed : `/${cleanPath}`;
}

