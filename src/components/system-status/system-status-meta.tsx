'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Clock, Info, Hash } from 'lucide-react';
import { SystemStatusVariant } from './types';
import { formatEstimatedTime } from './format-estimated-time';

interface SystemStatusMetaProps {
  variant: SystemStatusVariant;
  estimatedCompletion?: string;
  customNotice?: string;
  errorId?: string;
}

export function SystemStatusMeta({
  variant,
  estimatedCompletion,
  customNotice,
  errorId,
}: SystemStatusMetaProps) {
  const t = useTranslations('SystemStatus');
  const locale = useLocale();

  const hasAnyMeta = Boolean(
    (variant === 'maintenance' && estimatedCompletion) || customNotice || errorId
  );

  if (!hasAnyMeta) return null;

  const formattedTime = formatEstimatedTime(estimatedCompletion, locale);

  return (
    <div className="space-y-3 pt-2">
      {/* Scheduled Maintenance Window / Estimated Completion */}
      {variant === 'maintenance' && estimatedCompletion && (
        <div className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50/70 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-2xs">
          <Clock className="h-4 w-4 text-primary-700 shrink-0" />
          <span>{t('maintenance.estimatedCompletion', { time: formattedTime })}</span>
        </div>
      )}

      {/* Custom Notice Banner */}
      {customNotice && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600 shadow-2xs">
          <Info className="h-4 w-4 text-secondary-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{customNotice}</span>
        </div>
      )}

      {/* Error Reference ID for Troubleshooting */}
      {errorId && (
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-slate-500 shadow-2xs">
            <Hash className="h-3 w-3 text-slate-400" />
            <span>{t('common.errorReference', { id: errorId })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
