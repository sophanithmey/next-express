'use client';

import React, { useEffect, useState } from 'react';
import { SystemStatusPage } from '@/components/system-status/system-status-page';
import { SystemStatusVariant } from '@/components/system-status/types';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [variant, setVariant] = useState<SystemStatusVariant>('500');

  useEffect(() => {
    // Determine whether this was likely a network / offline connectivity error
    const isNetwork =
      typeof navigator !== 'undefined' &&
      (!navigator.onLine ||
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('failed to fetch'));

    if (isNetwork) {
      setVariant('network');
    } else {
      setVariant('500');
    }
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-140px)] flex-1 items-center justify-center py-8">
      <SystemStatusPage
        variant={variant}
        errorId={error.digest}
        onRetry={reset}
        primaryActionHref="/"
        showSupport={true}
      />
    </main>
  );
}
