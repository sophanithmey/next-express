'use client';

import React from 'react';
import { AlertTriangle, Hash } from 'lucide-react';
import { GlobalErrorActions } from './global-error-actions';
import { GlobalErrorSupport } from './global-error-support';

interface GlobalErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function GlobalErrorView({ error, reset }: GlobalErrorViewProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 text-center shadow-xl shadow-slate-200/40">
        {/* Ambient Background Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-100/30 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary-100/30 blur-2xl"
        />

        {/* Central Error Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-50 ring-1 ring-amber-200/60 shadow-inner" />
          <AlertTriangle
            className="h-10 w-10 text-amber-600 relative transition-transform hover:scale-105"
            strokeWidth={1.75}
          />
        </div>

        {/* Eyebrow Status Pill */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-900 uppercase shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Application Error</span>
        </div>

        {/* Heading & Description */}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Something Went Wrong
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          We encountered an unexpected problem. Please try refreshing or return to the homepage.
        </p>

        {/* Error Digest if available */}
        {error.digest && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-slate-500 shadow-2xs">
            <Hash className="h-3 w-3 text-slate-400" />
            <span>Ref: {error.digest}</span>
          </div>
        )}

        {/* Action Buttons */}
        <GlobalErrorActions onReset={reset} />

        {/* Direct Hotline Support Footer */}
        <GlobalErrorSupport />
      </div>
    </main>
  );
}
