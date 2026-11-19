import React from 'react';
import { useTranslations } from 'next-intl';
import { UserPlus, Smartphone, MessageSquareCode, KeyRound, CheckCircle2 } from 'lucide-react';
import { AuthFlowStepItem } from './auth-flow-step-item';

/**
 * Informational card explaining the 3-step setup process for new sellers.
 */
export function NewSellerCard() {
  const t = useTranslations('Home.instantAccess');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 lg:p-8 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between h-full space-y-6">
      {/* Header with Icon & Seller Type Badge */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-2xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center rounded-full border border-brand-200/90 bg-brand-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-800 shadow-2xs">
            {t('newBadge')}
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {t('newTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('newDesc')}
          </p>
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div className="py-2 sm:py-3 flex-1 flex flex-col justify-center">
        <AuthFlowStepItem
          icon={Smartphone}
          title={t('newStep1')}
          description={t('newStep1Desc')}
          accent="brand"
          isLast={false}
        />
        <AuthFlowStepItem
          icon={MessageSquareCode}
          title={t('newStep2')}
          description={t('newStep2Desc')}
          accent="brand"
          isLast={false}
        />
        <AuthFlowStepItem
          icon={KeyRound}
          title={t('newStep3')}
          description={t('newStep3Desc')}
          accent="brand"
          isLast={true}
        />
      </div>

      {/* Footer Benefit */}
      <div className="pt-4 border-t border-slate-100 flex items-start sm:items-center gap-2.5 text-xs text-slate-600">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
        <span className="font-medium leading-normal">{t('newPerk')}</span>
      </div>
    </div>
  );
}
