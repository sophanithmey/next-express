'use client';

import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import {
  BulkOrderDraft,
  downloadSampleCsvTemplate,
  downloadSampleXlsxTemplate,
} from '../services/bulk-order-parser';
import { MAX_BULK_ORDERS } from '@/lib/constants';

interface UseBulkOrderListSectionProps {
  orders: BulkOrderDraft[];
  onDirectFileUpload: (file: File) => void;
}

/**
 * Manages expand/collapse state, template download handlers, and direct file upload
 * for the BulkOrderListSection organism.
 */
export function useBulkOrderListSection({
  orders,
  onDirectFileUpload,
}: UseBulkOrderListSectionProps) {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const isOrderExpanded = useCallback(
    (orderId: string, idx: number) => {
      if (orderId in expandedMap) return expandedMap[orderId];
      return idx < 3;
    },
    [expandedMap],
  );

  const toggleOrder = useCallback(
    (orderId: string, idx: number) => {
      setExpandedMap((prev) => ({
        ...prev,
        [orderId]: !isOrderExpanded(orderId, idx),
      }));
    },
    [isOrderExpanded],
  );

  const allExpanded = useMemo(
    () =>
      orders.length > 0 &&
      orders.every((o, idx) => isOrderExpanded(o.id, idx)),
    [orders, isOrderExpanded],
  );

  const handleToggleAll = useCallback(() => {
    const nextState = !allExpanded;
    setExpandedMap(Object.fromEntries(orders.map((o) => [o.id, nextState])));
  }, [allExpanded, orders]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onDirectFileUpload(file);
      e.target.value = '';
    },
    [onDirectFileUpload],
  );

  const handleDownloadXlsxTemplate = useCallback(() => {
    void downloadSampleXlsxTemplate();
  }, []);

  const handleDownloadCsvTemplate = useCallback(() => {
    downloadSampleCsvTemplate();
  }, []);

  const isMaxOrders = orders.length >= MAX_BULK_ORDERS;

  return {
    isOrderExpanded,
    toggleOrder,
    allExpanded,
    handleToggleAll,
    handleFileChange,
    handleDownloadXlsxTemplate,
    handleDownloadCsvTemplate,
    isMaxOrders,
  };
}
