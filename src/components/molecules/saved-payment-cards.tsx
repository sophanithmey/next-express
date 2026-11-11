'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { PaymentCardItem } from '@/features/payment/types/payment-types';

interface SavedPaymentCardsProps {
  cards: PaymentCardItem[];
  selectedCardId: string | null;
  isAuthenticated: boolean;
  isLoadingCards?: boolean;
  isMutatingCard?: boolean;
  onSelectCard: (cardId: string) => void;
  onAddCard: () => void;
  onRefreshCards: () => void;
  onSetDefaultCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRequestAuth?: () => void;
}

export function SavedPaymentCards({
  cards,
  selectedCardId,
  isAuthenticated,
  isLoadingCards = false,
  isMutatingCard = false,
  onSelectCard,
  onAddCard,
  onRefreshCards,
  onSetDefaultCard,
  onDeleteCard,
  onRequestAuth,
}: SavedPaymentCardsProps) {
  const t = useTranslations('Payment');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-600">{t('signInForCards')}</span>
        {onRequestAuth && (
          <button
            type="button"
            onClick={onRequestAuth}
            className="shrink-0 rounded-lg bg-secondary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-secondary-700 transition cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-secondary-600" />
          <span>{t('savedCardsTitle')}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRefreshCards}
            disabled={isLoadingCards || isMutatingCard}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
          >
            <RefreshCw className={cn('h-3 w-3', isLoadingCards && 'animate-spin')} />
            <span>{t('refreshCards')}</span>
          </button>
          <button
            type="button"
            onClick={onAddCard}
            disabled={isMutatingCard}
            className="inline-flex items-center gap-1 rounded-lg bg-secondary-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-secondary-700 disabled:opacity-50 transition cursor-pointer"
          >
            {isMutatingCard ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            <span>{t('addCardButton')}</span>
          </button>
        </div>
      </div>

      {isLoadingCards && cards.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Loading saved cards…</span>
        </div>
      ) : cards.length === 0 ? (
        <p className="text-[11px] text-slate-500 py-1">{t('noSavedCards')}</p>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => {
            const isSelected = selectedCardId === card.id;
            const isConfirming = confirmDeleteId === card.id;

            return (
              <div
                key={card.id}
                className={cn(
                  'rounded-lg border bg-white p-2.5 flex flex-wrap items-center justify-between gap-2 transition',
                  isSelected
                    ? 'border-secondary-600 ring-1 ring-secondary-600/20'
                    : 'border-slate-200',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectCard(card.id)}
                  className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                >
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                      isSelected
                        ? 'border-secondary-600 bg-secondary-600 text-white'
                        : 'border-slate-300 bg-white',
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-3" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-slate-900">
                        {card.maskedCard}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {card.cardScheme}
                      </span>
                      {card.isDefault && (
                        <span className="rounded bg-success-50 px-1.5 py-0.5 text-[10px] font-bold text-success-700 border border-success-200">
                          {t('defaultCardBadge')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {card.issuer}
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!card.isDefault && (
                    <button
                      type="button"
                      disabled={isMutatingCard}
                      onClick={() => onSetDefaultCard(card.id)}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                    >
                      <Star className="h-2.5 w-2.5" />
                      <span>{t('setDefaultCard')}</span>
                    </button>
                  )}
                  {isConfirming ? (
                    <button
                      type="button"
                      disabled={isMutatingCard}
                      onClick={() => {
                        setConfirmDeleteId(null);
                        onDeleteCard(card.id);
                      }}
                      className="rounded border border-danger-300 bg-danger-50 px-2 py-1 text-[10px] font-bold text-danger-700 hover:bg-danger-100 cursor-pointer"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isMutatingCard}
                      aria-label="Delete card"
                      onClick={() => setConfirmDeleteId(card.id)}
                      className="rounded border border-slate-200 p-1 text-slate-400 hover:text-danger-600 hover:border-danger-200 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

