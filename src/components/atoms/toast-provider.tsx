'use client';

import React from 'react';
import { Toaster } from 'sonner';

/**
 * Global Sonner toast notification container styled for WingExpress.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className: 'font-sans rounded-xl shadow-lg',
      }}
    />
  );
}

