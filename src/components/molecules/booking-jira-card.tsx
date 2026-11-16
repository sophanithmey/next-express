'use client';

import React from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { CopiedState } from '@/features/booking/hooks/use-booking-history';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';
import {
  Check,
  Copy,
  Zap,
  Calendar,
  ArrowUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface BookingJiraCardProps {
  order: BookingOrder;
  copiedItem?: CopiedState | null;
  onCopyId?: (order: BookingOrder) => void;
  onCopyLink?: (order: BookingOrder) => void;
  onNavigateDetail?: (orderId: string) => void;
  isDark?: boolean;
}

function getInitials(name?: string, fallback = 'WN'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(str: string): string {
  const colors = [
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-blue-600 text-white',
    'bg-purple-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-indigo-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_LEFT_BORDER: Record<string, string> = {
  draft: 'border-l-amber-400',
  pending: 'border-l-amber-500',
  confirmed: 'border-l-amber-500',
  assigned: 'border-l-sky-500',
  out_for_delivery: 'border-l-purple-500',
  delivered: 'border-l-emerald-500',
  cancelled: 'border-l-rose-500',
};

/**
 * Compact Jira-style issue card for courier deliveries.
 */
export function BookingJiraCard({
  order,
  copiedItem,
  onCopyId,
  onCopyLink,
  onNavigateDetail,
  isDark = true,
}: BookingJiraCardProps) {
  const isCopied = copiedItem?.id === order.id && copiedItem?.type === 'id';
  const leftBorder = STATUS_LEFT_BORDER[order.status] || 'border-l-slate-400';
  const assigneeName = order.deliverer?.name || order.recipient.name || 'Courier';
  const initials = getInitials(assigneeName);
  const avatarBg = getAvatarColor(assigneeName);

  const displayTitle = order.parcel.description || order.parcel.sellerOrderRef || order.recipient.name || 'Express Parcel';
  const dropoffAddress = order.dropoff.address || 'Address pending';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigateDetail?.(order.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigateDetail?.(order.id);
        }
      }}
      className={cn(
        'group relative rounded-lg border-l-3 p-3 transition-all cursor-pointer text-left focus:outline-hidden',
        leftBorder,
        isDark
          ? 'bg-[#22272e] border-y border-r border-[#373e47] hover:border-sky-500/80 hover:bg-[#282e38] text-slate-100 shadow-2xs'
          : 'bg-white border-y border-r border-slate-200/90 hover:border-primary-400 hover:shadow-xs text-slate-900',
      )}
    >
      {/* Top Row: Ticket key + Summary & quick copy */}
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-xs font-semibold leading-snug line-clamp-2 select-none">
          <span className={cn('font-mono font-bold mr-1', isDark ? 'text-primary-400' : 'text-primary-800')}>
            [EXP] {order.trackingNumber}
          </span>
          <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
            — {displayTitle}
          </span>
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyId?.(order);
          }}
          title={`Copy ${order.trackingNumber}`}
          className={cn(
            'shrink-0 p-1 rounded-md transition opacity-0 group-hover:opacity-100 focus:opacity-100',
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600',
          )}
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Middle Row: Destination Address */}
      <div className="mt-1.5 flex items-center gap-1 text-[11px]">
        <MapPin className={cn('h-3 w-3 shrink-0', isDark ? 'text-slate-500' : 'text-slate-400')} />
        <span className={cn('truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {dropoffAddress}
        </span>
      </div>

      {/* Bottom Metadata Row: Speed/Priority, Price, COD, and Jira Assignee Avatar */}
      <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] select-none"
        style={{ borderColor: isDark ? '#2e353f' : '#f1f5f9' }}
      >
        {/* Left: Speed Icon + Reference */}
        <div className="flex items-center gap-1.5">
          {order.deliveryOption === 'instant' ? (
            <span className="flex items-center text-amber-500 font-semibold" title="Instant Delivery">
              <Zap className="h-3 w-3 mr-0.5 fill-amber-500" />
            </span>
          ) : order.deliveryOption === 'scheduled' || order.deliveryOption === 'same_day' ? (
            <span className="flex items-center text-sky-400" title="Scheduled Delivery">
              <Calendar className="h-3 w-3 mr-0.5" />
            </span>
          ) : (
            <span className="flex items-center text-emerald-500" title="High Priority">
              <ArrowUp className="h-3 w-3 mr-0.5 stroke-[2.5]" />
            </span>
          )}

          <span className={cn('font-mono font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
            {APP_CONFIG.currencySymbol}{order.deliveryFee.toFixed(2)}
          </span>
        </div>

        {/* Right: COD Tag + Jira Style Assignee (= SC) */}
        <div className="flex items-center gap-2">
          {order.cod?.isCod && (
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold font-mono',
              isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : 'bg-amber-50 text-amber-800 border border-amber-200',
            )}>
              COD ${order.cod.amount.toFixed(2)}
            </span>
          )}

          <div className="flex items-center gap-1">
            <span className={cn('font-mono text-xs font-bold leading-none', isDark ? 'text-slate-500' : 'text-slate-400')}>
              =
            </span>
            <div
              title={assigneeName}
              className={cn(
                'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight shrink-0',
                avatarBg,
              )}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
