'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentOptionCard } from './payment-option-card';
import { PaymentMethodDetails } from './payment-method-details';
import {
  PaymentCardItem,
  PaymentOptionItem,
} from '@/features/payment/types/payment-types';
import { isCardPaymentProvider } from '@/features/payment/utils/payment-provider-helpers';

export interface BulkPaymentMethodListProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
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

/**
 * Lists all payment methods supported in single booking (dynamic API options with full 5-method fallback).
 */
export function BulkPaymentMethodList({
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
}: BulkPaymentMethodListProps) {
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
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          {t('selectMethod')}
        </span>
        {isLoadingOptions && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
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

      {isCardPaymentProvider(selectedMethod) && (
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
      )}
    </div>
  );
}
