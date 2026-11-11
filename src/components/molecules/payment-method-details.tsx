'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { QrCode, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { normalizePaymentKind } from '@/features/payment/utils/payment-provider-helpers';
import { PaymentCardItem } from '@/features/payment/types/payment-types';
import { SavedPaymentCards } from './saved-payment-cards';

interface PaymentMethodDetailsProps {
  selectedMethod: string;
  deliveryFee: number;
  cards?: PaymentCardItem[];
  selectedCardId?: string | null;
  isAuthenticated?: boolean;
  isLoadingCards?: boolean;
  isMutatingCard?: boolean;
  onSelectCard?: (cardId: string) => void;
  onAddCard?: () => void;
  onRefreshCards?: () => void;
  onSetDefaultCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onRequestAuth?: () => void;
}

export const DEMO_WING_POINTS_BALANCE = 12500; // ~ $3.12 USD
export const WING_POINTS_RATE = 4000; // 4,000 points per $1.00 USD

export function PaymentMethodDetails({
  selectedMethod,
  deliveryFee,
  cards = [],
  selectedCardId = null,
  isAuthenticated = false,
  isLoadingCards = false,
  isMutatingCard = false,
  onSelectCard,
  onAddCard,
  onRefreshCards,
  onSetDefaultCard,
  onDeleteCard,
  onRequestAuth,
}: PaymentMethodDetailsProps) {
  const t = useTranslations('Payment');
  const kind = normalizePaymentKind(selectedMethod);

  if (kind === 'khqr') {
    const formattedAmount = `${APP_CONFIG.currencySymbol}${deliveryFee.toFixed(2)}`;
    return (
      <div className="mt-3 rounded-xl border border-secondary-200 bg-secondary-50/60 p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="h-24 w-24 bg-white border border-secondary-200 rounded-xl p-1.5 flex flex-col items-center justify-center shadow-xs shrink-0">
          <QrCode className="h-16 w-16 text-slate-800" />
          <span className="text-[9px] font-bold text-secondary-700 tracking-wider">
            KHQR BAKONG
          </span>
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-bold text-slate-900 text-xs block">
            {t('scanToPay', { amount: formattedAmount })}
          </span>
          <p className="text-[11px] text-slate-600">{t('scanToPayDesc')}</p>
          <span className="text-[10px] text-secondary-800 font-semibold inline-block">
            {t('scanVerifyNote')}
          </span>
        </div>
      </div>
    );
  }

  if (kind === 'wingpoint') {
    const pointsRequired = Math.round(deliveryFee * WING_POINTS_RATE);
    const hasEnoughPoints = DEMO_WING_POINTS_BALANCE >= pointsRequired;
    const remainingPoints = DEMO_WING_POINTS_BALANCE - pointsRequired;

    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-amber-950 block">
                {t('payWithWingPointsTitle')}
              </span>
              <span className="text-[10px] text-amber-800">
                {t('wingPointsExchangeRate')}
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-xs text-amber-900 bg-white/80 border border-amber-200 px-2.5 py-1 rounded-lg">
            {t('ptsShort', { points: pointsRequired.toLocaleString() })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-white/70 p-2 border border-amber-200/60">
            <span className="text-slate-500 block">{t('availablePointsLabel')}</span>
            <span className="font-mono font-bold text-slate-900">
              {t('ptsShort', { points: DEMO_WING_POINTS_BALANCE.toLocaleString() })}
            </span>
            <span className="text-[10px] text-slate-400 block">
              (~${(DEMO_WING_POINTS_BALANCE / WING_POINTS_RATE).toFixed(2)})
            </span>
          </div>

          <div className="rounded-lg bg-white/70 p-2 border border-amber-200/60">
            <span className="text-slate-500 block">{t('balanceAfterPaymentLabel')}</span>
            <span className="font-mono font-bold text-slate-900">
              {t('ptsShort', { points: Math.max(0, remainingPoints).toLocaleString() })}
            </span>
            <span className="text-[10px] text-slate-400 block">
              (~${(Math.max(0, remainingPoints) / WING_POINTS_RATE).toFixed(2)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {hasEnoughPoints ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('sufficientWingPoints')}</span>
            </span>
          ) : (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>{t('insufficientWingPointsOrder')}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  if (kind === 'card' && onSelectCard && onAddCard && onRefreshCards && onSetDefaultCard && onDeleteCard) {
    return (
      <SavedPaymentCards
        cards={cards}
        selectedCardId={selectedCardId}
        isAuthenticated={isAuthenticated}
        isLoadingCards={isLoadingCards}
        isMutatingCard={isMutatingCard}
        onSelectCard={onSelectCard}
        onAddCard={onAddCard}
        onRefreshCards={onRefreshCards}
        onSetDefaultCard={onSetDefaultCard}
        onDeleteCard={onDeleteCard}
        onRequestAuth={onRequestAuth}
      />
    );
  }

  return null;
}
