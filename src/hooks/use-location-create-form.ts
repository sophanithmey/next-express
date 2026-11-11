'use client';

import { useCallback, useState } from 'react';
import type React from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  CreateSavedLocationInput,
  createSavedLocationSchema,
} from '@/features/booking/schemas/location-schema';
import type { SavedLocationItem } from '@/components/molecules/location-picker-saved-list';

export interface CreateLocationDraft {
  name: string;
  address: string;
  contact: string;
  remark: string;
  houseNumber: string;
  streetNumber: string;
}

interface UseLocationCreateFormParams {
  draft: CreateLocationDraft;
  coordinates: GeoCoordinates;
  onDraftChange: (next: CreateLocationDraft) => void;
  onSubmit: (
    input: CreateSavedLocationInput,
  ) => Promise<SavedLocationItem | 'auth_required'>;
}

/**
 * Manages field edits, optional address detail toggle, Zod validation,
 * and submission state for `LocationPickerCreateForm`.
 */
export function useLocationCreateForm({
  draft,
  coordinates,
  onDraftChange,
  onSubmit,
}: UseLocationCreateFormParams) {
  const [showDetails, setShowDetails] = useState(
    Boolean(draft.houseNumber || draft.streetNumber),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  const updateField = useCallback(
    <K extends keyof CreateLocationDraft>(key: K, value: CreateLocationDraft[K]) => {
      setError(null);
      onDraftChange({ ...draft, [key]: value });
    },
    [draft, onDraftChange],
  );

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const candidate: CreateSavedLocationInput = {
        name: draft.name,
        address: draft.address,
        coordinates,
        type: 'consumer',
        contact: draft.contact || undefined,
        remark: draft.remark || undefined,
        addressDetail:
          draft.houseNumber || draft.streetNumber
            ? {
                house_number: draft.houseNumber || undefined,
                street_number: draft.streetNumber || undefined,
              }
            : undefined,
      };

      const parsed = createSavedLocationSchema.safeParse(candidate);
      if (!parsed.success) {
        setError(parsed.error.errors[0]?.message || 'Please check location fields');
        return;
      }

      setError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(parsed.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to save location. Please try again.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [coordinates, draft, isSubmitting, onSubmit],
  );

  return {
    showDetails,
    error,
    isSubmitting,
    toggleDetails,
    updateField,
    handleSave,
  };
}

