'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tag, X, Sparkles, AlertCircle } from 'lucide-react';
import {
  PromoCode,
  PromoErrorCode,
  validatePromoCode,
  DEMO_PROMO_CHIPS,
} from '@/features/booking/services/promo-service';
import { APP_CONFIG } from '@/lib/constants';

interface PromoCodeInputProps {
  currentFee: number;
  appliedPromo: PromoCode | null;
  discountAmount: number;
  onApplyPromo: (promo: PromoCode, discount: number) => void;
  onRemovePromo: () => void;
}

const KNOWN_PROMO_CODES = new Set([
  'WINGEXPRESS',
  'FREE50',
  'WELCOME20',
  'VIPWING',
]);

export function PromoCodeInput({
  currentFee,
  appliedPromo,
  discountAmount,
  onApplyPromo,
  onRemovePromo,
}: PromoCodeInputProps) {
  const t = useTranslations('Payment');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resolveErrorMessage = (
    errorCode?: PromoErrorCode,
    meta?: { code?: string; minFee?: string },
    fallback?: string
  ) => {
    if (errorCode === 'empty') return t('promoErrors.empty');
    if (errorCode === 'invalid') {
      return t('promoErrors.invalid', { code: meta?.code || '' });
    }
    if (errorCode === 'min_fee') {
      return t('promoErrors.minFee', { amount: meta?.minFee || '0.00' });
    }
    return fallback || t('promoInvalidFallback');
  };

  const handleApply = (codeToApply?: string) => {
    setError(null);
    const targetCode = codeToApply || code;
    const result = validatePromoCode(targetCode, currentFee);

    if (result.isValid && result.promo) {
      onApplyPromo(result.promo, result.discountAmount);
      setCode('');
    } else {
      setError(
        resolveErrorMessage(
          result.errorCode,
          result.errorMeta,
          result.errorMessage
        )
      );
    }
  };

  if (appliedPromo) {
    const isKnown = KNOWN_PROMO_CODES.has(appliedPromo.code);
    const labelText = isKnown
      ? t(`promoCatalog.${appliedPromo.code}_label`)
      : appliedPromo.label;
    const descText = isKnown
      ? t(`promoCatalog.${appliedPromo.code}_desc`)
      : appliedPromo.description;
    const savedAmount = `${APP_CONFIG.currencySymbol}${discountAmount.toFixed(2)}`;

    return (
      <div className="rounded-2xl border border-success-200 bg-success-50/60 p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center text-success-700">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-success-900 uppercase">
                  {appliedPromo.code}
                </span>
                <span className="text-[10px] font-bold text-success-800 bg-success-100 px-2 py-0.5 rounded-full">
                  {labelText}
                </span>
              </div>
              <p className="text-[11px] text-success-700 mt-0.5">
                {descText} • {t('savingAmount', { amount: savedAmount })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemovePromo}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-white/80 cursor-pointer"
            title={t('removePromoTitle')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="promo-input" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-secondary-600" />
          <span>{t('promoCodeLabel')}</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">
          {t('optionalDiscount')}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="promo-input"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder={t('promoPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:border-secondary-500 focus:outline-hidden focus:ring-2 focus:ring-secondary-500/20 transition"
          />
        </div>
        <button
          type="button"
          onClick={() => handleApply()}
          disabled={!code.trim()}
          className="rounded-xl bg-secondary-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {t('apply')}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Demo Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mr-0.5">
          <Sparkles className="h-2.5 w-2.5 text-amber-500" />
          <span>{t('promoTryPrefix')}</span>
        </span>
        {DEMO_PROMO_CHIPS.map((chip) => (
          <button
            key={chip.code}
            type="button"
            onClick={() => handleApply(chip.code)}
            className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-secondary-50 hover:text-secondary-700 hover:border-secondary-300 border border-slate-200/80 px-2 py-0.5 rounded-lg transition cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
