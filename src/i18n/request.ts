import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // 1. Explicit override passed to awaitable functions (e.g. getTranslations({locale: 'en'}))
  // 2. Or the segment matched by proxy/middleware (awaited from requestLocale)
  const requested = locale ?? (await requestLocale);

  // 3. Ensure valid locale, else fallback to defaultLocale (handles undefined or invalid routes)
  const finalLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: finalLocale,
    messages: (await import(`../../messages/${finalLocale}.json`)).default,
  };
});
