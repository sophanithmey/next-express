'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApiService } from '../services/payment-api-service';
import { paymentKeys } from './payment-keys';
import {
  PaymentAvailabilityResult,
  PaymentOptionItem,
} from '../types/payment-types';

export function usePaymentOptions(
  isAuthenticated: boolean,
  serviceType = 'ST_EXPRESS',
) {
  const locale = useLocale();
  const queryClient = useQueryClient();

  const optionsQuery = useQuery({
    queryKey: [
      ...paymentKeys.options(serviceType),
      locale,
      isAuthenticated ? 'auth' : 'guest',
    ],
    queryFn: () => paymentApiService.listOptions({ serviceType, locale }),
    staleTime: 60_000,
  });

  const refreshOptions = useCallback(async () => {
    await optionsQuery.refetch();
  }, [optionsQuery]);

  const checkAvailability = useCallback(
    async (providerCode: string): Promise<PaymentAvailabilityResult | null> => {
      if (!providerCode) return null;
      try {
        return await queryClient.fetchQuery({
          queryKey: [...paymentKeys.availability(providerCode, serviceType), locale],
          queryFn: () =>
            paymentApiService.checkAvailability({
              providerCode,
              serviceType,
              locale,
            }),
          staleTime: 10_000,
        });
      } catch {
        return null;
      }
    },
    [locale, queryClient, serviceType],
  );

  const options: PaymentOptionItem[] = optionsQuery.data?.options ?? [];
  const source = optionsQuery.data?.source ?? 'preview';

  return {
    options,
    source,
    isLoadingOptions: optionsQuery.isFetching,
    refreshOptions,
    checkAvailability,
  };
}
