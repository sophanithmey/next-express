'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { paymentApiService } from '../services/payment-api-service';
import { paymentKeys } from './payment-keys';

export function usePaymentDetail(
  paymentId: string | null | undefined,
  enabled = true,
) {
  const locale = useLocale();
  const trimmedId = paymentId?.trim() || '';

  const detailQuery = useQuery({
    queryKey: [...paymentKeys.detail(trimmedId), locale],
    queryFn: () => paymentApiService.getPaymentDetail(trimmedId, locale),
    enabled: enabled && trimmedId.length > 0,
    staleTime: 30_000,
    retry: false,
  });

  const refreshDetail = useCallback(async () => {
    if (!enabled || !trimmedId) return null;
    const res = await detailQuery.refetch();
    return res.data ?? null;
  }, [detailQuery, enabled, trimmedId]);

  return {
    paymentDetail: detailQuery.data ?? null,
    isLoadingDetail: detailQuery.isFetching,
    refreshDetail,
  };
}
