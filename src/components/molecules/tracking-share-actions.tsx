'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Link2, MessageSquareText } from 'lucide-react';
import { buildTrackingSharePayload } from '@/features/booking/services/tracking-share-helper';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

interface TrackingShareActionsProps {
  tracking: string;
  recipient: string;
  dropoff: string;
  codAmount: number;
  layout?: 'stacked' | 'inline';
}

export function TrackingShareActions({
  tracking,
  recipient,
  dropoff,
  codAmount,
}: TrackingShareActionsProps) {
  const locale = useLocale();
  const tPayment = useTranslations('Payment');

  const [origin, setOrigin] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { fullTrackingUrl, buyerMessage } = buildTrackingSharePayload({
    tracking,
    locale,
    origin,
    recipient,
    dropoff,
    codAmount,
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(fullTrackingUrl);
    setCopiedLink(true);
    toast.success(tPayment('linkCopied'));
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(buyerMessage);
    setCopiedMsg(true);
    toast.success(tPayment('messageCopied'));
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {/* 1. Primary Important Action: Copy Live Tracking Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={cn(
          'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition cursor-pointer whitespace-nowrap',
          copiedLink
            ? 'bg-success-600 text-white'
            : 'bg-secondary-600 text-white hover:bg-secondary-700'
        )}
      >
        {copiedLink ? (
          <>
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{tPayment('linkCopied')}</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span>{tPayment('copyLiveLink')}</span>
          </>
        )}
      </button>

      {/* 2. Copy Formatted Buyer Message */}
      <button
        type="button"
        onClick={handleCopyMessage}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
      >
        {copiedMsg ? (
          <>
            <Check className="h-3.5 w-3.5 shrink-0 text-success-600" />
            <span className="text-success-700 font-bold">
              {tPayment('messageCopied')}
            </span>
          </>
        ) : (
          <>
            <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>{tPayment('copyMessageShort')}</span>
          </>
        )}
      </button>
    </div>
  );
}
