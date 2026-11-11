'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  PaymentAvailabilityResult,
  PaymentOptionItem,
} from '../types/payment-types';

interface PaymentOptionsResponse {
  options?: PaymentOptionItem[];
  source?: 'live' | 'mock' | 'preview';
}

/**
 * Loads Express payment options (`ST_EXPRESS`) and provides live provider availability checks.
 */
export function usePaymentOptions(
  isAuthenticated: boolean,
  serviceType = 'ST_EXPRESS',
) {
  const locale = useLocale();
  const [options, setOptions] = useState<PaymentOptionItem[]>([]);
  const [source, setSource] = useState<'live' | 'mock' | 'preview'>('preview');
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const res = await fetch(
        `/api/payments/options?serviceType=${encodeURIComponent(serviceType)}`,
        {
          headers: { 'Accept-Language': locale.toUpperCase() },
          cache: 'no-store',
        },
      );
      if (!res.ok) return;
      const data = (await res.json()) as PaymentOptionsResponse;
      if (Array.isArray(data.options)) {
        setOptions(data.options);
      }
      if (data.source) {
        setSource(data.source);
      }
    } catch {
      // Keep previous/fallback options silently
    } finally {
      setIsLoadingOptions(false);
    }
  }, [locale, serviceType]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions, isAuthenticated]);

  const checkAvailability = useCallback(
    async (providerCode: string): Promise<PaymentAvailabilityResult | null> => {
      if (!providerCode) return null;
      try {
        const res = await fetch(
          `/api/payments/options/${encodeURIComponent(providerCode)}/availability?serviceType=${encodeURIComponent(serviceType)}`,
          {
            headers: { 'Accept-Language': locale.toUpperCase() },
            cache: 'no-store',
          },
        );
        if (!res.ok) return null;
        return (await res.json()) as PaymentAvailabilityResult;
      } catch {
        return null;
      }
    },
    [locale, serviceType],
  );

  return {
    options,
    source,
    isLoadingOptions,
    refreshOptions: loadOptions,
    checkAvailability,
  };
}

