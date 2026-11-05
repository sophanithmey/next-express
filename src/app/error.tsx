'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/atoms/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-1 max-w-md text-xs text-slate-500">
        An unexpected error occurred while loading this view. You can safely try again.
      </p>
      <div className="mt-5">
        <Button variant="primary" size="sm" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
