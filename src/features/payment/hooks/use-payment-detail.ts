'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { PaymentDetailRecord } from '../types/payment-types';

/**
 * Fetches and refreshes transaction details (`GET /api/payments/:paymentId`).
 */
export function usePaymentDetail(
  paymentId: string | null | undefined,
  enabled = true,
) {
  const locale = useLocale();
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetailRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const refreshDetail = useCallback(async () => {
    const trimmed = paymentId?.trim();
    if (!trimmed || !enabled) return;

    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/payments/${encodeURIComponent(trimmed)}`, {
        headers: { 'Accept-Language': locale.toUpperCase() },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = (await res.json()) as PaymentDetailRecord;
      if (data?.id) {
        setPaymentDetail(data);
      }
    } catch {
      // Non-blocking enrichment
    } finally {
      setIsLoadingDetail(false);
    }
  }, [paymentId, enabled, locale]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  return {
    paymentDetail,
    isLoadingDetail,
    refreshDetail,
  };
}

