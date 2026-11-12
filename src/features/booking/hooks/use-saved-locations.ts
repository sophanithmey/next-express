'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateSavedLocationInput } from '../schemas/location-schema';
import { locationApiService } from '../services/location-api-service';
import { SavedLocationItem } from '../types/booking-types';
import { locationKeys } from './booking-keys';

export type { SavedLocationItem } from '../types/booking-types';

export function useSavedLocations(
  initialLocations: SavedLocationItem[],
  isAuthenticated: boolean,
  locale: string,
) {
  const queryClient = useQueryClient();
  const queryKey = [
    ...locationKeys.list(locale),
    isAuthenticated ? 'auth' : 'guest',
  ] as const;

  const locationsQuery = useQuery({
    queryKey,
    queryFn: () => locationApiService.listLocations({ locale }),
    initialData: initialLocations,
    staleTime: 30_000,
  });

  const refreshLocations = useCallback(async () => {
    await locationsQuery.refetch();
  }, [locationsQuery]);

  const createLocationMutation = useMutation({
    mutationFn: (input: CreateSavedLocationInput) =>
      locationApiService.createLocation(input, locale),
    onSuccess: async (created) => {
      queryClient.setQueryData<SavedLocationItem[]>(queryKey, (prev = []) => [
        created,
        ...prev.filter((item) => item.id !== created.id),
      ]);
      await queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });

  const createLocation = useCallback(
    (input: CreateSavedLocationInput): Promise<SavedLocationItem> =>
      createLocationMutation.mutateAsync(input),
    [createLocationMutation],
  );

  return {
    savedLocations: locationsQuery.data ?? initialLocations,
    isLoadingLocations: locationsQuery.isFetching,
    refreshLocations,
    createLocation,
  };
}
