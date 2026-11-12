'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApiService } from '../services/booking-api-service';
import { getUserSavedDrafts } from '../services/booking-draft-service';
import { BookingFormData, SavedBookingDraft } from '../types/booking-types';
import { bookingKeys } from './booking-keys';

interface UseBookingDraftsParams {
  isAuthenticated: boolean;
  userId?: string;
  locale: string;
}

export function useBookingDrafts({
  isAuthenticated,
  userId,
  locale,
}: UseBookingDraftsParams) {
  const queryClient = useQueryClient();
  const [localVersion, setLocalVersion] = useState(0);

  const draftsQuery = useQuery({
    queryKey: [...bookingKeys.drafts(), locale],
    queryFn: () => bookingApiService.listDrafts(locale),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const savedDrafts = useMemo<SavedBookingDraft[]>(() => {
    if (!isAuthenticated) return [];
    const apiDrafts = draftsQuery.data ?? [];
    const localDrafts = getUserSavedDrafts(userId);
    const seen = new Set(apiDrafts.map((draft) => draft.orderId || draft.id));
    return [
      ...apiDrafts,
      ...localDrafts.filter((draft) => !seen.has(draft.orderId || draft.id)),
    ];
    // localVersion forces re-read of localStorage drafts after local delete
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftsQuery.data, isAuthenticated, localVersion, userId]);

  const refreshDrafts = useCallback(async () => {
    setLocalVersion((prev) => prev + 1);
    if (!isAuthenticated) return;
    await queryClient.invalidateQueries({ queryKey: bookingKeys.drafts() });
  }, [isAuthenticated, queryClient]);

  const saveDraftMutation = useMutation({
    mutationFn: (formData: BookingFormData) =>
      bookingApiService.saveDraft(formData, locale),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingKeys.drafts() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
      ]);
    },
  });

  return {
    savedDrafts,
    isLoadingDrafts: draftsQuery.isFetching,
    isSavingDraft: saveDraftMutation.isPending,
    saveDraft: saveDraftMutation.mutateAsync,
    refreshDrafts,
  };
}

