'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { APP_CONFIG } from '@/lib/constants';

const COPY_RESET_DELAY_MS = 2000;

export interface UseAppDownloadReturn {
  qrDataUrl: string;
  isCopied: boolean;
  appDownloadUrl: string;
  handleCopyLink: () => Promise<void>;
}

/**
 * Generates the branded Wingmall OneLink QR code and handles one-click link copying.
 */
export function useAppDownload(): UseAppDownloadReturn {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(APP_CONFIG.appDownloadUrl, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#04172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback gracefully; store links remain accessible if QR canvas fails
      });

    return () => {
      isMounted = false;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(APP_CONFIG.appDownloadUrl);
      setIsCopied(true);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, COPY_RESET_DELAY_MS);
    } catch {
      // Clipboard write may be denied by browser permissions; fail silently
    }
  }, []);

  return {
    qrDataUrl,
    isCopied,
    appDownloadUrl: APP_CONFIG.appDownloadUrl,
    handleCopyLink,
  };
}

