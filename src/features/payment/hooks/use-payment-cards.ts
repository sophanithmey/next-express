'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  CreatePaymentCardResult,
  PaymentCardItem,
} from '../types/payment-types';

/**
 * Manages seller saved payment cards (`GET/POST /consumer/payment-cards`, default setting, delete).
 */
export function usePaymentCards(isAuthenticated: boolean) {
  const locale = useLocale();
  const [cards, setCards] = useState<PaymentCardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isMutatingCard, setIsMutatingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    if (!isAuthenticated) {
      setCards([]);
      setSelectedCardId(null);
      return;
    }

    setIsLoadingCards(true);
    setCardError(null);
    try {
      const res = await fetch('/api/payments/cards', {
        headers: { 'Accept-Language': locale.toUpperCase() },
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setCardError(body.message || null);
        return;
      }
      const data = (await res.json()) as { cards?: PaymentCardItem[] };
      const list = Array.isArray(data.cards) ? data.cards : [];
      setCards(list);
      setSelectedCardId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list.find((c) => c.isDefault)?.id || list[0]?.id || null;
      });
    } catch {
      setCardError('Unable to load saved cards.');
    } finally {
      setIsLoadingCards(false);
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const createCard = useCallback(
    async (provider: string, serviceCode = 'ST_EXPRESS'): Promise<string | null> => {
      if (isMutatingCard) return null;
      setIsMutatingCard(true);
      setCardError(null);
      try {
        const res = await fetch('/api/payments/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': locale.toUpperCase(),
          },
          body: JSON.stringify({
            platform: 'UNIFIED',
            provider,
            serviceCode,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as CreatePaymentCardResult & {
          card?: PaymentCardItem;
          message?: string;
        };
        if (!res.ok) {
          toast.error(data.message || 'Unable to initiate card setup.');
          return null;
        }
        await loadCards();
        return data.redirectUrl || null;
      } catch {
        toast.error('Unable to reach payment card service.');
        return null;
      } finally {
        setIsMutatingCard(false);
      }
    },
    [isMutatingCard, locale, loadCards],
  );

  const setDefaultCard = useCallback(
    async (cardId: string) => {
      if (isMutatingCard) return;
      setIsMutatingCard(true);
      try {
        const res = await fetch(`/api/payments/cards/${encodeURIComponent(cardId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': locale.toUpperCase(),
          },
          body: JSON.stringify({ isDefault: true }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string };
          toast.error(body.message || 'Failed to set default card.');
          return;
        }
        setSelectedCardId(cardId);
        await loadCards();
      } catch {
        toast.error('Failed to update default card.');
      } finally {
        setIsMutatingCard(false);
      }
    },
    [isMutatingCard, locale, loadCards],
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (isMutatingCard) return;
      setIsMutatingCard(true);
      try {
        const res = await fetch(`/api/payments/cards/${encodeURIComponent(cardId)}`, {
          method: 'DELETE',
          headers: { 'Accept-Language': locale.toUpperCase() },
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string };
          toast.error(body.message || 'Failed to delete card.');
          return;
        }
        await loadCards();
      } catch {
        toast.error('Failed to delete payment card.');
      } finally {
        setIsMutatingCard(false);
      }
    },
    [isMutatingCard, locale, loadCards],
  );

  return {
    cards,
    selectedCardId,
    setSelectedCardId,
    isLoadingCards,
    isMutatingCard,
    cardError,
    refreshCards: loadCards,
    createCard,
    setDefaultCard,
    deleteCard,
  };
}

