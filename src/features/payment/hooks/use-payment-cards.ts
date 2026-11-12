'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentApiService } from '../services/payment-api-service';
import { paymentKeys } from './payment-keys';
import { PaymentCardItem } from '../types/payment-types';

const EMPTY_CARDS: PaymentCardItem[] = [];

export function usePaymentCards(isAuthenticated: boolean) {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [manualSelectedCardId, setManualSelectedCardId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const cardsQuery = useQuery({
    queryKey: [...paymentKeys.cards(), locale],
    queryFn: () => paymentApiService.listCards(locale),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const cards = isAuthenticated ? (cardsQuery.data ?? EMPTY_CARDS) : EMPTY_CARDS;

  const selectedCardId = useMemo<string | null>(() => {
    if (cards.length === 0) return null;
    if (
      manualSelectedCardId &&
      cards.some((card) => card.id === manualSelectedCardId)
    ) {
      return manualSelectedCardId;
    }
    return cards.find((card) => card.isDefault)?.id || cards[0]?.id || null;
  }, [cards, manualSelectedCardId]);

  const setSelectedCardId = useCallback((cardId: string | null) => {
    setManualSelectedCardId(cardId);
  }, []);

  const refreshCards = useCallback(async () => {
    if (!isAuthenticated) return;
    setActionError(null);
    await cardsQuery.refetch();
  }, [cardsQuery, isAuthenticated]);

  const createCardMutation = useMutation({
    mutationFn: (vars: { provider: string; serviceCode: string }) =>
      paymentApiService.createCard(
        {
          platform: 'UNIFIED',
          provider: vars.provider,
          serviceCode: vars.serviceCode,
        },
        locale,
      ),
    onSuccess: async (result) => {
      setActionError(null);
      if (result.card?.id) {
        setManualSelectedCardId(result.card.id);
        toast.success('Payment card added successfully');
      }
      await queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : 'Unable to register payment card';
      setActionError(msg);
      toast.error(msg);
    },
  });

  const setDefaultCardMutation = useMutation({
    mutationFn: (cardId: string) =>
      paymentApiService.setDefaultCard({ cardId, isDefault: true, locale }),
    onSuccess: async (_, cardId) => {
      setActionError(null);
      setManualSelectedCardId(cardId);
      toast.success('Default payment card updated');
      await queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : 'Failed to update default card';
      setActionError(msg);
      toast.error(msg);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) =>
      paymentApiService.deleteCard({ cardId, locale }),
    onSuccess: async (_, cardId) => {
      setActionError(null);
      if (manualSelectedCardId === cardId) {
        setManualSelectedCardId(null);
      }
      toast.success('Card removed');
      await queryClient.invalidateQueries({ queryKey: paymentKeys.cards() });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete card';
      setActionError(msg);
      toast.error(msg);
    },
  });

  const createCard = useCallback(
    async (provider: string, serviceCode = 'ST_EXPRESS'): Promise<string | null> => {
      if (!isAuthenticated) return null;
      try {
        const result = await createCardMutation.mutateAsync({
          provider,
          serviceCode,
        });
        return result.redirectUrl || null;
      } catch {
        return null;
      }
    },
    [createCardMutation, isAuthenticated],
  );

  const setDefaultCard = useCallback(
    async (cardId: string) => {
      if (!isAuthenticated || !cardId) return;
      try {
        await setDefaultCardMutation.mutateAsync(cardId);
      } catch {
        // Error surfaced in onError toast/state
      }
    },
    [isAuthenticated, setDefaultCardMutation],
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!isAuthenticated || !cardId) return;
      try {
        await deleteCardMutation.mutateAsync(cardId);
      } catch {
        // Error surfaced in onError toast/state
      }
    },
    [deleteCardMutation, isAuthenticated],
  );

  const queryError =
    cardsQuery.error instanceof Error ? cardsQuery.error.message : null;

  return {
    cards,
    selectedCardId,
    setSelectedCardId,
    isLoadingCards: cardsQuery.isFetching,
    isMutatingCard:
      createCardMutation.isPending ||
      setDefaultCardMutation.isPending ||
      deleteCardMutation.isPending,
    cardError: actionError ?? queryError,
    refreshCards,
    createCard,
    setDefaultCard,
    deleteCard,
  };
}
