'use client';

import { useState } from 'react';
import {
  BulkOrderDraft,
  ParsedBulkOrder,
  parseBulkOrderText,
  convertOrdersToBulkDrafts,
  parseBulkOrderFile,
  SAMPLE_BULK_CSV,
} from '../services/bulk-order-parser';
import { MAX_BULK_ORDERS } from '@/lib/constants';

interface UseBulkUploadModalProps {
  onApplyOrders: (orders: BulkOrderDraft[]) => void;
  onClose: () => void;
}

export function useBulkUploadModal({
  onApplyOrders,
  onClose,
}: UseBulkUploadModalProps) {
  const [inputText, setInputText] = useState('');
  const [parsedOrders, setParsedOrders] = useState<ParsedBulkOrder[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleTextChange = (text: string) => {
    setInputText(text);
    setParsedOrders(parseBulkOrderText(text));
  };

  const handleLoadSample = () => handleTextChange(SAMPLE_BULK_CSV);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const text = await parseBulkOrderFile(file);
      handleTextChange(text);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const importableOrders = parsedOrders
    .filter((o) => !o.exceedsOrderLimit && o.validStopCount > 0)
    .slice(0, MAX_BULK_ORDERS);
  const importOrderCount = importableOrders.length;
  const totalStopCount = importableOrders.reduce(
    (sum, o) => sum + o.validStopCount,
    0,
  );
  const codOverLimitOrders = importableOrders.filter((o) => o.isCodOverLimit);

  const handleImport = () => {
    if (importOrderCount === 0) return;
    const drafts = convertOrdersToBulkDrafts(importableOrders);
    onApplyOrders(drafts);
    onClose();
  };

  return {
    inputText,
    parsedOrders,
    isUploading,
    importOrderCount,
    totalStopCount,
    codOverLimitOrders,
    handleTextChange,
    handleLoadSample,
    handleFileUpload,
    handleImport,
  };
}
