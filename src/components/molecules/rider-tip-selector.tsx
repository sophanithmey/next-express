'use client';

import React, { useState } from 'react';
import { Heart, HandCoins, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';

const PRESET_TIPS = [0.5, 1, 2] as const;
const MAX_CUSTOM_TIP = 100;

interface RiderTipSelectorProps {
  tipAmount: number;
  onChangeTip: (amount: number) => void;
}

export function RiderTipSelector({ tipAmount, onChangeTip }: RiderTipSelectorProps) {
  const tPayment = useTranslations('Payment');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const isPresetSelected = (amount: number) => !isCustomMode && tipAmount === amount;
  const isNoTipSelected = !isCustomMode && tipAmount === 0;

  const handleSelectNoTip = () => {
    setIsCustomMode(false);
    setCustomInput('');
    onChangeTip(0);
  };

  const handleSelectPreset = (amount: number) => {
    setIsCustomMode(false);
    setCustomInput('');
    onChangeTip(amount);
  };

  const handleOpenCustom = () => {
    setIsCustomMode(true);
    if (tipAmount > 0) {
      setCustomInput(String(tipAmount));
    }
  };

  const handleCustomChange = (raw: string) => {
    // Allow numbers and single decimal point with up to 2 decimals
    if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) {
      return;
    }
    setCustomInput(raw);

    if (raw === '' || raw === '.') {
      onChangeTip(0);
      return;
    }

    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(MAX_CUSTOM_TIP, Math.max(0, parsed));
      onChangeTip(Math.round(clamped * 100) / 100);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
            <HandCoins className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              {tPayment('tipTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tPayment('tipSubtitle')}
            </p>
          </div>
        </div>

        {tipAmount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-bold text-amber-800 font-mono">
            +{APP_CONFIG.currencySymbol}
            {tipAmount.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            {tPayment('tipOptional')}
          </span>
        )}
      </div>

      {/* Preset Tip Options */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <button
          type="button"
          onClick={handleSelectNoTip}
          className={cn(
            'min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
            isNoTipSelected
              ? 'border-secondary-600 bg-secondary-50 text-secondary-800 ring-1 ring-secondary-600'
              : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100/80'
          )}
        >
          {tPayment('noTip')}
        </button>

        {PRESET_TIPS.map((amount) => {
          const active = isPresetSelected(amount);
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleSelectPreset(amount)}
              className={cn(
                'relative min-h-11 rounded-xl border px-3 py-2 text-xs font-bold font-mono transition-all',
                active
                  ? 'border-secondary-600 bg-secondary-50 text-secondary-800 ring-1 ring-secondary-600 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-secondary-300 hover:bg-secondary-50/40'
              )}
            >
              {APP_CONFIG.currencySymbol}
              {amount.toFixed(2)}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleOpenCustom}
          className={cn(
            'min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition-all col-span-2 sm:col-span-1',
            isCustomMode
              ? 'border-secondary-600 bg-secondary-50 text-secondary-800 ring-1 ring-secondary-600'
              : 'border-slate-200 bg-white text-slate-700 hover:border-secondary-300 hover:bg-secondary-50/40'
          )}
        >
          {tPayment('tipCustom')}
        </button>
      </div>

      {/* Custom Tip Input */}
      {isCustomMode && (
        <div className="flex items-center gap-2 pt-0.5">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center font-mono text-sm font-bold text-slate-400">
              {APP_CONFIG.currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={tPayment('tipPlaceholder')}
              aria-label={tPayment('tipCustom')}
              className="min-h-11 w-full rounded-xl border border-secondary-300 bg-white pl-8 pr-4 py-2 text-sm font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-secondary-600 focus:outline-hidden focus:ring-2 focus:ring-secondary-500/20"
            />
          </div>
          <button
            type="button"
            onClick={handleSelectNoTip}
            className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            title={tPayment('remove')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Appreciation Confirmation */}
      {tipAmount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900">
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-500 fill-rose-500" />
          <span className="font-medium">
            {tPayment('tipThanks', {
              amount: `${APP_CONFIG.currencySymbol}${tipAmount.toFixed(2)}`,
            })}
          </span>
        </div>
      )}
    </div>
  );
}

