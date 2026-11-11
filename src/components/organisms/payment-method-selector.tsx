'use client';

import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentMethodDetails } from '../molecules/payment-method-details';
import { PaymentOptionCard } from '../molecules/payment-option-card';
import {
  PaymentCardItem,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';

export type PaymentMethodType = string;

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  deliveryFee: number;
  apiOptions?: PaymentOptionItem[];
  isLoadingOptions?: boolean;
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

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  deliveryFee,
  apiOptions = [],
  isLoadingOptions = false,
  cards,
  selectedCardId,
  isAuthenticated,
  isLoadingCards,
  isMutatingCard,
  onSelectCard,
  onAddCard,
  onRefreshCards,
  onSetDefaultCard,
  onDeleteCard,
  onRequestAuth,
}: PaymentMethodSelectorProps) {
  const t = useTranslations('Payment');

  const fallbackOptions: PaymentOptionItem[] = [
    {
      id: 'khqr',
      providerCode: 'khqr',
      title: t('khqr'),
      subtitle: t('khqrDesc'),
      subtitleImages: [],
      isDefault: true,
      isAvailable: true,
    },
    {
      id: 'wing_point',
      providerCode: 'wing_point',
      title: t('wingpoint'),
      subtitle: t('wingpointDesc'),
      subtitleImages: [],
      isDefault: false,
      isAvailable: true,
    },
    {
      id: 'wing_pay',
      providerCode: 'wing_pay',
      title: t('wallet'),
      subtitle: t('walletDesc'),
      subtitleImages: [],
      isDefault: false,
      isAvailable: true,
    },
    {
      id: 'cash_on_delivery',
      providerCode: 'cash_on_delivery',
      title: t('cash'),
      subtitle: t('cashDesc'),
      subtitleImages: [],
      isDefault: false,
      isAvailable: true,
    },
    {
      id: 'card',
      providerCode: 'card',
      title: t('card'),
      subtitle: t('cardDesc'),
      subtitleImages: [],
      isDefault: false,
      isAvailable: true,
    },
  ];

  const options = apiOptions.length > 0 ? apiOptions : fallbackOptions;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>{t('selectMethod')}</span>
            <span className="text-[10px] bg-secondary-50 text-secondary-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5 text-secondary-700" />
              <span>{t('zeroProcessingFees')}</span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('selectMethodSubtitle')}</p>
        </div>
        {isLoadingOptions && (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <PaymentOptionCard
            key={opt.id}
            option={opt}
            isSelected={selectedMethod === opt.providerCode}
            defaultLabel={t('defaultCardBadge')}
            onSelect={onSelectMethod}
          />
        ))}
      </div>

      <PaymentMethodDetails
        selectedMethod={selectedMethod}
        deliveryFee={deliveryFee}
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
    </div>
  );
}
