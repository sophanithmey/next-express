import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing, Locale } from './routing';

/**
 * Server-side in-memory dictionary cache.
 * Avoids redundant dynamic imports and JSON re-evaluations across concurrent requests.
 */
const messagesCache = new Map<string, Record<string, unknown>>();

async function loadLocaleMessages(locale: string): Promise<Record<string, unknown>> {
  const cached = messagesCache.get(locale);
  if (cached) {
    return cached;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;
  messagesCache.set(locale, messages);
  return messages;
}

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // 1. Explicit override passed to awaitable functions (e.g. getTranslations({locale: 'en'}))
  // 2. Or the segment matched by proxy/middleware (awaited from requestLocale)
  const requested = locale ?? (await requestLocale);

  // 3. Ensure valid locale, else fallback to defaultLocale (handles undefined or invalid routes)
  const finalLocale: Locale = hasLocale(routing.locales, requested)
    ? (requested as Locale)
    : routing.defaultLocale;

  const messages = await loadLocaleMessages(finalLocale);

  return {
    locale: finalLocale,
    messages,
  };
});
