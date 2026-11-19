'use client';

import React from 'react';
import { SystemStatusVariant } from './types';
import { cn } from '@/lib/cn';

interface SystemStatusEyebrowProps {
  eyebrow: string;
  variant: SystemStatusVariant;
  className?: string;
}

export function SystemStatusEyebrow({
  eyebrow,
  variant,
  className,
}: SystemStatusEyebrowProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'maintenance':
        return 'border-primary-300 bg-primary-50 text-slate-950 shadow-primary-500/10';
      case '500':
        return 'border-amber-300 bg-amber-50 text-amber-900 shadow-amber-500/10';
      case '503':
        return 'border-secondary-300 bg-secondary-50 text-secondary-900 shadow-secondary-500/10';
      case '404':
        return 'border-slate-300 bg-slate-100 text-slate-800 shadow-slate-500/10';
      case 'network':
        return 'border-amber-300 bg-amber-50 text-amber-900 shadow-amber-500/10';
      case 'general':
      default:
        return 'border-slate-300 bg-slate-100 text-slate-800 shadow-slate-500/10';
    }
  };

  return (
    <div
      className={cn(
        'mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase shadow-2xs',
        getVariantStyles(),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      <span>{eyebrow}</span>
    </div>
  );
}
