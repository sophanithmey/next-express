import React from 'react';
import { STATUS_COLORS, STATUS_LABELS, BookingStatus } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };
  const label = STATUS_LABELS[status] || status;

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
      <span className={cn('h-1.5 w-1.5 rounded-full', color.text.replace('text-', 'bg-'))} />
      {label}
    </span>
  );
}

