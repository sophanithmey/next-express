'use client';

import { useCallback, useMemo } from 'react';
import { DropoffStop } from '../types/booking-types';
import { BulkOrderDraft } from '../services/bulk-order-parser';
import { calculateTotalStopCod } from '../services/booking-form-helpers';
import { MAX_STOPS_PER_BULK_ORDER, MAX_TOTAL_COD_USD } from '@/lib/constants';

interface UseBulkOrderCardProps {
  order: BulkOrderDraft;
  errors?: Record<string, string>;
  showErrors: boolean;
}

export interface BulkStopFieldErrors {
  phoneError?: string;
  addressError?: string;
  codError?: string;
}

/**
 * Computes COD totals, limit/error flags, collapsed recipient preview,
 * and per-stop validation error lookups for BulkOrderCard.
 */
export function useBulkOrderCard({
  order,
  errors = {},
  showErrors,
}: UseBulkOrderCardProps) {
  const orderCod = useMemo(
    () => calculateTotalStopCod(order.stops),
    [order.stops],
  );

  const isCodOverLimit = orderCod > MAX_TOTAL_COD_USD;
  const hasOrderErrors = useMemo(
    () => Object.keys(errors).length > 0,
    [errors],
  );
  const hasVisibleError = (showErrors && hasOrderErrors) || isCodOverLimit;
  const isMaxStops = order.stops.length >= MAX_STOPS_PER_BULK_ORDER;

  const recipientPreview = useMemo(() => {
    const base = order.stops
      .map(
        (s) =>
          s.recipient.name?.trim() || s.recipient.phoneNumber?.trim() || '—',
      )
      .slice(0, 3)
      .join(' · ');
    return order.stops.length > 3
      ? `${base} +${order.stops.length - 3}`
      : base;
  }, [order.stops]);

  const getStopErrors = useCallback(
    (stop: DropoffStop, stopIdx: number): BulkStopFieldErrors => ({
      phoneError: showErrors
        ? errors[`dropoffs.${stopIdx}.phoneNumber`]
        : undefined,
      addressError: showErrors
        ? errors[`dropoffs.${stopIdx}.address`]
        : undefined,
      codError:
        isCodOverLimit && (stop.codAmount ?? 0) > 0
          ? errors['cod.amount']
          : showErrors
            ? errors[`dropoffs.${stopIdx}.codAmount`]
            : undefined,
    }),
    [errors, showErrors, isCodOverLimit],
  );

  return {
    orderCod,
    isCodOverLimit,
    hasOrderErrors,
    hasVisibleError,
    isMaxStops,
    recipientPreview,
    getStopErrors,
  };
}
