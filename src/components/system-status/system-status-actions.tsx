'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SystemStatusVariant } from './types';
import { RefreshCw, Home } from 'lucide-react';
import { SystemStatusSupport } from './system-status-support';

interface SystemStatusActionsProps {
  variant: SystemStatusVariant;
  onRetry?: () => void | Promise<void>;
  primaryActionHref?: string;
  isRetrying?: boolean;
  showSupport?: boolean;
}

export function SystemStatusActions({
  variant,
  onRetry,
  primaryActionHref = '/',
  isRetrying = false,
  showSupport = true,
}: SystemStatusActionsProps) {
  const t = useTranslations('SystemStatus');
  const [internalRetrying, setInternalRetrying] = useState(false);

  const activeRetrying = isRetrying || internalRetrying;

  const handleRetryClick = async () => {
    if (activeRetrying) return;
    if (onRetry) {
      setInternalRetrying(true);
      try {
        await onRetry();
      } finally {
        setInternalRetrying(false);
      }
    } else {
      setInternalRetrying(true);
      window.location.reload();
    }
  };

  const isMaintenance = variant === 'maintenance';
  const is404 = variant === '404';

  return (
    <div className="space-y-6 pt-2">
      {/* Primary Action Button Group */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {isMaintenance ? (
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={activeRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-primary-500/20 hover:bg-primary-400 active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${activeRetrying ? 'animate-spin' : ''}`} />
            <span>{t('maintenance.refresh')}</span>
          </button>
        ) : is404 ? (
          <Link
            href={primaryActionHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-primary-500/20 hover:bg-primary-400 active:scale-[0.98] transition"
          >
            <Home className="h-4 w-4" />
            <span>{t('error404.home')}</span>
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRetryClick}
              disabled={activeRetrying}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-primary-500/20 hover:bg-primary-400 active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${activeRetrying ? 'animate-spin' : ''}`} />
              <span>
                {variant === 'network'
                  ? t('errorNetwork.tryAgain')
                  : t('error500.tryAgain')}
              </span>
            </button>

            <Link
              href={primaryActionHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] transition shadow-2xs"
            >
              <Home className="h-4 w-4 text-slate-500" />
              <span>{t('error500.home')}</span>
            </Link>
          </>
        )}
      </div>

      {/* Support Section */}
      {showSupport && <SystemStatusSupport />}
    </div>
  );
}
