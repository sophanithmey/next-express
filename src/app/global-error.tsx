'use client';

import React from 'react';
import './globals.css';
import { GlobalErrorView } from '@/components/global-error/global-error-view';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-slate-50 antialiased flex flex-col font-sans'>
        <GlobalErrorView error={error} reset={reset} />
      </body>
    </html>
  );
}
