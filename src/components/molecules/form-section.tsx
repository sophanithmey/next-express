'use client';

import React from 'react';

interface FormSectionProps {
  number: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function FormSection({
  number,
  title,
  subtitle,
  icon,
  children,
  action,
}: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-bold font-mono">
            {icon || number}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

