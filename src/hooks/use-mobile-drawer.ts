'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface UseMobileDrawerOptions {
  onClose: () => void;
}

/**
 * Encapsulates routing, current locale, and search-preserving language switching
 * for mobile navigation drawer components.
 */
export function useMobileDrawer({ onClose }: UseMobileDrawerOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageSwitch = useCallback(
    (newLocale: 'km' | 'en') => {
      if (newLocale === locale) return;
      const search = typeof window !== 'undefined' ? window.location.search : '';
      router.replace(`${pathname}${search}`, { locale: newLocale });
      onClose();
    },
    [locale, pathname, router, onClose],
  );

  return {
    pathname,
    locale,
    handleLanguageSwitch,
  };
}
