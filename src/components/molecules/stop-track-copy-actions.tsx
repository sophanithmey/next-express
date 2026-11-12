'use client';

import React, { useState } from 'react';
import { Check, Link2, MessageSquareText } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { DropoffStop } from '@/features/booking/types/booking-types';
import { buildTrackingSharePayload } from '@/features/booking/services/tracking-share-helper';
import { cn } from '@/lib/cn';

interface StopTrackCopyActionsProps {
  tracking: string;
  stop: DropoffStop;
  index: number;
  includeCopyMessage?: boolean;
  linkLabel?: string;
}

/**
 * Reusable per-stop copy buttons that generate an isolated `/track/[id]?stop=...`
 * link and optional buyer message scoped strictly to one customer stop.
 */
export function StopTrackCopyActions({
  tracking,
  stop,
  index,
  includeCopyMessage = false,
  linkLabel,
}: StopTrackCopyActionsProps) {
  const tPayment = useTranslations('Payment');
  const locale = useLocale();
  const [copiedKind, setCopiedKind] = useState<'link' | 'msg' | null>(null);

  const handleCopy = async (kind: 'link' | 'msg') => {
    const stopId = stop.id || `stop-${index + 1}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { fullTrackingUrl, buyerMessage } = buildTrackingSharePayload({
      tracking,
      locale,
      origin,
      recipient: stop.recipient?.name || `Customer ${index + 1}`,
      dropoff: stop.dropoff?.address || '',
      codAmount: stop.codAmount ?? 0,
      stopId,
    });

    await navigator.clipboard.writeText(
      kind === 'link' ? fullTrackingUrl : buyerMessage
    );
    setCopiedKind(kind);
    toast.success(tPayment(kind === 'link' ? 'linkCopied' : 'messageCopied'));
    setTimeout(() => setCopiedKind(null), 2000);
  };

  const isLinkCopied = copiedKind === 'link';
  const isMsgCopied = copiedKind === 'msg';

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={() => handleCopy('link')}
        className={cn(
          'inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap',
          isLinkCopied
            ? 'border-success-600 bg-success-600 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-secondary-300 hover:bg-secondary-50/60 hover:text-secondary-700'
        )}
      >
        {isLinkCopied ? (
          <Check className="h-3 w-3 shrink-0" />
        ) : (
          <Link2 className="h-3 w-3 text-secondary-600 shrink-0" />
        )}
        <span>
          {isLinkCopied ? tPayment('linkCopied') : linkLabel || tPayment('copyStopLink')}
        </span>
      </button>

      {includeCopyMessage && (
        <button
          type="button"
          onClick={() => handleCopy('msg')}
          className={cn(
            'inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap',
            isMsgCopied
              ? 'border-success-200 bg-success-50 text-success-700 font-bold'
              : 'border-secondary-200 bg-secondary-50/80 text-secondary-700 hover:bg-secondary-100/80'
          )}
        >
          {isMsgCopied ? (
            <Check className="h-3 w-3 text-success-600 shrink-0" />
          ) : (
            <MessageSquareText className="h-3 w-3 text-secondary-600 shrink-0" />
          )}
          <span>
            {isMsgCopied ? tPayment('messageCopied') : tPayment('copyStopMsg')}
          </span>
        </button>
      )}
    </div>
  );
}

