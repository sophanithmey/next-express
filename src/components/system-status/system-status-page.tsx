'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SystemStatusProps } from './types';
import { SystemStatusCard } from './system-status-card';
import { SystemStatusIllustration } from './system-status-illustration';
import { SystemStatusEyebrow } from './system-status-eyebrow';
import { SystemStatusMeta } from './system-status-meta';
import { SystemStatusActions } from './system-status-actions';

export function SystemStatusPage({
  variant,
  eyebrow,
  title,
  description,
  errorId,
  estimatedCompletion,
  customNotice,
  onRetry,
  primaryActionHref = '/',
  isRetrying = false,
  showSupport = true,
}: SystemStatusProps) {
  const t = useTranslations('SystemStatus');

  const getDefaults = () => {
    switch (variant) {
      case 'maintenance':
        return {
          eyebrow: t('maintenance.eyebrow'),
          title: t('maintenance.title'),
          description: t('maintenance.description'),
        };
      case '500':
        return {
          eyebrow: t('error500.eyebrow'),
          title: t('error500.title'),
          description: t('error500.description'),
        };
      case '503':
        return {
          eyebrow: t('error503.eyebrow'),
          title: t('error503.title'),
          description: t('error503.description'),
        };
      case '404':
        return {
          eyebrow: t('error404.eyebrow'),
          title: t('error404.title'),
          description: t('error404.description'),
        };
      case 'network':
        return {
          eyebrow: t('errorNetwork.eyebrow'),
          title: t('errorNetwork.title'),
          description: t('errorNetwork.description'),
        };
      case 'general':
      default:
        return {
          eyebrow: t('errorGeneral.eyebrow'),
          title: t('errorGeneral.title'),
          description: t('errorGeneral.description'),
        };
    }
  };

  const defaults = getDefaults();
  const displayEyebrow = eyebrow || defaults.eyebrow;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <SystemStatusCard>
      {/* Central Illustration */}
      <div className="mb-6">
        <SystemStatusIllustration variant={variant} />
      </div>

      {/* Eyebrow Status Pill */}
      <SystemStatusEyebrow eyebrow={displayEyebrow} variant={variant} />

      {/* Headings */}
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {displayTitle}
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        {displayDescription}
      </p>

      {/* Metadata & Notices (Completion time, announcement, or error ID) */}
      <SystemStatusMeta
        variant={variant}
        estimatedCompletion={estimatedCompletion}
        customNotice={customNotice}
        errorId={errorId}
      />

      {/* Primary Actions & Support */}
      <SystemStatusActions
        variant={variant}
        onRetry={onRetry}
        primaryActionHref={primaryActionHref}
        isRetrying={isRetrying}
        showSupport={showSupport}
      />
    </SystemStatusCard>
  );
}
