'use client';

import React from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface GlobalErrorActionsProps {
  onReset: () => void;
}

export function GlobalErrorActions({ onReset }: GlobalErrorActionsProps) {
  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        type="button"
        onClick={onReset}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-primary-500/20 hover:bg-primary-400 active:scale-[0.98] transition cursor-pointer"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Try Again</span>
      </button>

      <Link
        href="/"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] transition shadow-2xs"
      >
        <Home className="h-4 w-4 text-slate-500" />
        <span>Go to Homepage</span>
      </Link>
    </div>
  );
}
