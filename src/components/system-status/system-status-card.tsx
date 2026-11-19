'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface SystemStatusCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SystemStatusCard({ children, className }: SystemStatusCardProps) {
  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className={cn(
          'relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 text-center shadow-xl shadow-slate-200/40',
          className
        )}
      >
        {/* Subtle background ambient blur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary-100/30 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary-100/30 blur-2xl"
        />

        {children}
      </div>
    </div>
  );
}
