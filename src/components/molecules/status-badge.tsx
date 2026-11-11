'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { STATUS_COLORS, STATUS_LABELS, BookingStatus } from '@/lib/constants';
import { cn } from '@/lib/cn';

const KNOWN_STATUS_KEYS = new Set([
  'draft',
  'pending',
  'confirmed',
  'assigned',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

const STATUS_DOT_CLASSES: Record<string, string> = {
  draft: 'bg-amber-600',
  pending: 'bg-warning-600',
  confirmed: 'bg-brand-600',
  assigned: 'bg-secondary-600',
  out_for_delivery: 'bg-brand-lime-700',
  delivered: 'bg-success-600',
  cancelled: 'bg-danger-600',
};

interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tStatus = useTranslations('Status');
  const color = STATUS_COLORS[status] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };
  const dotClass = STATUS_DOT_CLASSES[status] || 'bg-slate-500';
  const label = KNOWN_STATUS_KEYS.has(status)
    ? tStatus(status)
    : STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClass)} />
      {label}
    </span>
  );
}
