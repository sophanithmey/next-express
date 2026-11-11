'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface FormSectionProps {
  number?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  titleClassName?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function FormSection({
  number,
  title,
  subtitle,
  icon,
  iconClassName,
  titleClassName,
  children,
  action,
}: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition shadow-2xs shrink-0',
              iconClassName || 'bg-brand-50 text-brand-700 border border-brand-200/60'
            )}
          >
            {icon || number}
          </div>
          <div>
            <h2 className={cn('text-sm font-bold tracking-tight', titleClassName || 'text-slate-900')}>
              {title}
            </h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

