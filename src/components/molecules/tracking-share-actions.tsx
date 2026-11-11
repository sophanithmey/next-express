'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import {
  Check,
  ExternalLink,
  Link2,
  MessageSquareText,
  Send,
} from 'lucide-react';
import { buildTrackingSharePayload } from '@/features/booking/services/tracking-share-helper';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

interface TrackingShareActionsProps {
  tracking: string;
  recipient: string;
  dropoff: string;
  codAmount: number;
  /** 'stacked' uses a 2x2 grid for sidebars; 'inline' spans 4 columns on wide cards */
  layout?: 'stacked' | 'inline';
}

export function TrackingShareActions({
  tracking,
  recipient,
  dropoff,
  codAmount,
  layout = 'stacked',
}: TrackingShareActionsProps) {
  const locale = useLocale();
  const tPayment = useTranslations('Payment');

  const [origin, setOrigin] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { trackingPath, fullTrackingUrl, buyerMessage, telegramShareUrl } =
    buildTrackingSharePayload({
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
    <div
      className={cn(
        'grid gap-2.5',
        layout === 'inline' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
      )}
    >
      {/* 1. Primary Action: Copy Live Tracking Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={cn(
          'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition whitespace-nowrap',
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

      {/* 2. Open Public Live View (Positioned 2nd in 2x2 sidebar, 4th in wide row) */}
      <Link
        href={trackingPath}
        className={cn(
          'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 transition whitespace-nowrap',
          layout === 'inline' && 'sm:order-4'
        )}
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-secondary-600" />
        <span>{tPayment('liveView')}</span>
      </Link>

      {/* 3. Telegram Instant Share */}
      <a
        href={telegramShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/90 px-3.5 py-2 text-xs font-semibold text-sky-700 hover:border-sky-300 hover:bg-sky-100/80 transition whitespace-nowrap"
      >
        <Send className="h-3.5 w-3.5 shrink-0" />
        <span>{tPayment('shareTelegram')}</span>
      </a>

      {/* 4. Copy Formatted Buyer Receipt Message */}
      <button
        type="button"
        onClick={handleCopyMessage}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition whitespace-nowrap"
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
