'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BulkBatchSubmissionItem } from '../services/bulk-batch-submitter';
import { buildTrackingSharePayload } from '../services/tracking-share-helper';

export type BulkResultStatusFilter = 'all' | 'success' | 'failed';

export interface BulkOrderResultEntry {
  item: BulkBatchSubmissionItem;
  idx: number;
}

export interface BulkOrderResultMetrics {
  totalStops: number;
  totalFee: number;
  totalCod: number;
}

/**
 * Manages state, derived KPI metrics, status/search filtering, and bulk tracking copy
 * for the Bulk Upload Order booking success screen.
 */
export function useBulkOrderResult(results: BulkBatchSubmissionItem[]) {
  const locale = useLocale();
  const tBooking = useTranslations('Booking');

  const [statusFilter, setStatusFilter] =
    useState<BulkResultStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const succeeded = useMemo(
    () => results.filter((r) => r.status === 'success' && r.createdOrder),
    [results],
  );

  const failed = useMemo(
    () => results.filter((r) => r.status === 'failed'),
    [results],
  );

  const metrics = useMemo<BulkOrderResultMetrics>(() => {
    let totalStops = 0;
    let totalFee = 0;
    let totalCod = 0;
    for (const item of succeeded) {
      totalStops += item.draft.stops.length;
      totalFee += item.createdOrder?.deliveryFee ?? 0;
      totalCod += item.createdOrder?.cod?.amount ?? 0;
    }
    return {
      totalStops,
      totalFee: Math.round(totalFee * 100) / 100,
      totalCod: Math.round(totalCod * 100) / 100,
    };
  }, [succeeded]);

  const filteredEntries = useMemo<BulkOrderResultEntry[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return results
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (!q) return true;
        const tracking = item.createdOrder?.trackingNumber?.toLowerCase() || '';
        const orderRef = item.draft.orderRef?.toLowerCase() || '';
        const stopMatch = item.draft.stops.some(
          (s) =>
            s.dropoff.address.toLowerCase().includes(q) ||
            s.recipient.phoneNumber.toLowerCase().includes(q) ||
            (s.recipient.name?.toLowerCase().includes(q) ?? false),
        );
        return tracking.includes(q) || orderRef.includes(q) || stopMatch;
      });
  }, [results, statusFilter, searchQuery]);

  const filterTabs = useMemo(
    () =>
      [
        {
          id: 'all' as const,
          label: tBooking('bulkResultFilterAll', { count: results.length }),
        },
        {
          id: 'success' as const,
          label: tBooking('bulkResultFilterSuccess', {
            count: succeeded.length,
          }),
        },
        {
          id: 'failed' as const,
          label: tBooking('bulkResultFilterFailed', { count: failed.length }),
        },
      ] as const,
    [tBooking, results.length, succeeded.length, failed.length],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCopyAllTracking = useCallback(async () => {
    if (succeeded.length === 0) return;
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const lines = succeeded.map((item, i) => {
        const order = item.createdOrder!;
        const firstStop = item.draft.stops[0];
        const { fullTrackingUrl } = buildTrackingSharePayload({
          tracking: order.trackingNumber,
          locale,
          origin,
          recipient: firstStop?.recipient.name || 'Recipient',
          dropoff: firstStop?.dropoff.address || '',
          codAmount: order.cod?.amount ?? 0,
        });
        const ref = item.draft.orderRef ? ` (${item.draft.orderRef})` : '';
        return `#${i + 1}${ref} — ${order.trackingNumber} — ${fullTrackingUrl}`;
      });
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedAll(true);
      toast.success(
        tBooking('bulkResultAllTrackingCopied', { count: succeeded.length }),
      );
      setTimeout(() => setCopiedAll(false), 2200);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  }, [succeeded, locale, tBooking]);

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    clearSearch,
    copiedAll,
    succeeded,
    failed,
    metrics,
    filteredEntries,
    filterTabs,
    handleCopyAllTracking,
  };
}
