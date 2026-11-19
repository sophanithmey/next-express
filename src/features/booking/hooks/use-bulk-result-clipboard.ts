'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { buildTrackingSharePayload } from '../services/tracking-share-helper';

interface UseBulkResultClipboardProps {
  order?: BookingOrder;
  firstStop?: DropoffStop;
}

export function useBulkResultClipboard({
  order,
  firstStop,
}: UseBulkResultClipboardProps) {
  const locale = useLocale();
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');
  const [copiedField, setCopiedField] = useState<'id' | 'link' | null>(null);

  const tracking = order?.trackingNumber || '';
  const orderCod = order?.cod?.amount ?? 0;

  const handleCopyId = async () => {
    if (!tracking) return;
    try {
      await navigator.clipboard.writeText(tracking);
      setCopiedField('id');
      toast.success(`${tCommon('copied')}: ${tracking}`);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  const handleCopyLink = async () => {
    if (!tracking || !order) return;
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { fullTrackingUrl } = buildTrackingSharePayload({
        tracking,
        locale,
        origin,
        recipient: firstStop?.recipient.name || 'Recipient',
        dropoff: firstStop?.dropoff.address || '',
        codAmount: orderCod,
      });
      await navigator.clipboard.writeText(fullTrackingUrl);
      setCopiedField('link');
      toast.success(tPayment('linkCopied'));
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return {
    copiedField,
    handleCopyId,
    handleCopyLink,
  };
}
