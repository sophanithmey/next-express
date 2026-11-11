'use client';

import { useState, useCallback } from 'react';
import {
  DropoffLocation,
  RecipientInfo,
  DropoffStop,
  CodInfo,
} from '../types/booking-types';
import { seedPerStopCodOnExpand } from '../services/booking-form-helpers';
import { useSortableList } from '@/hooks/use-sortable-list';

interface UseDropoffSectionProps {
  dropoff: DropoffLocation;
  recipient: RecipientInfo;
  dropoffs?: DropoffStop[];
  cod?: CodInfo;
  onChangeDropoff: (dropoff: DropoffLocation) => void;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onChangeDropoffs?: (stops: DropoffStop[]) => void;
}

/**
 * Manages multi-drop stop state, collapsing, COD seeding, drag-reordering, and bulk replacement.
 */
export function useDropoffSection({
  dropoff,
  recipient,
  dropoffs,
  cod,
  onChangeDropoff,
  onChangeRecipient,
  onChangeDropoffs,
}: UseDropoffSectionProps) {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [collapsedStops, setCollapsedStops] = useState<Record<string, boolean>>({});

  const currentStops: DropoffStop[] =
    dropoffs && dropoffs.length > 0 ? dropoffs : [{ id: 'stop-1', recipient, dropoff }];
  const isMultiDrop = currentStops.length > 1;

  const handleToggleCollapse = useCallback((stopId: string) => {
    setCollapsedStops((prev) => ({ ...prev, [stopId]: !prev[stopId] }));
  }, []);

  const handleUpdateStop = useCallback(
    (
      index: number,
      updatedRecipient: RecipientInfo,
      updatedDropoff: DropoffLocation,
      codAmount?: number
    ) => {
      const nextStops = currentStops.map((stop, i) =>
        i === index
          ? {
              ...stop,
              recipient: updatedRecipient,
              dropoff: updatedDropoff,
              ...(codAmount !== undefined ? { codAmount } : {}),
            }
          : stop
      );
      if (index === 0) {
        onChangeRecipient(updatedRecipient);
        onChangeDropoff(updatedDropoff);
      }
      onChangeDropoffs?.(nextStops);
    },
    [currentStops, onChangeRecipient, onChangeDropoff, onChangeDropoffs]
  );

  const handleAddStop = useCallback(() => {
    const seededStops = cod ? seedPerStopCodOnExpand(currentStops, cod) : currentStops;
    const nextIdx = seededStops.length + 1;
    const newStopId = `stop-${Date.now()}`;
    const newStop: DropoffStop = {
      id: newStopId,
      recipient: { name: '', phoneNumber: '', notes: '' },
      dropoff: {
        address: '',
        coordinates: { lat: 11.5512 + nextIdx * 0.005, lng: 104.9256 + nextIdx * 0.005 },
      },
      codAmount: 0,
    };

    const nextCollapsed: Record<string, boolean> = {};
    seededStops.forEach((s) => {
      nextCollapsed[s.id] = true;
    });
    nextCollapsed[newStopId] = false;
    setCollapsedStops(nextCollapsed);
    onChangeDropoffs?.([...seededStops, newStop]);
  }, [currentStops, cod, onChangeDropoffs]);

  const handleRemoveStop = useCallback(
    (index: number) => {
      if (currentStops.length <= 1) return;
      const nextStops = currentStops.filter((_, i) => i !== index);
      if (index === 0 && nextStops.length > 0) {
        onChangeRecipient(nextStops[0].recipient);
        onChangeDropoff(nextStops[0].dropoff);
      }
      onChangeDropoffs?.(nextStops);
    },
    [currentStops, onChangeRecipient, onChangeDropoff, onChangeDropoffs]
  );

  const handleBulkApply = useCallback(
    (importedStops: DropoffStop[]) => {
      if (importedStops.length === 0) return;
      onChangeRecipient(importedStops[0].recipient);
      onChangeDropoff(importedStops[0].dropoff);
      onChangeDropoffs?.(importedStops);
    },
    [onChangeRecipient, onChangeDropoff, onChangeDropoffs]
  );

  const handleReorderStops = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return;
      const reordered = [...currentStops];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      if (newIndex === 0 || oldIndex === 0) {
        onChangeRecipient(reordered[0].recipient);
        onChangeDropoff(reordered[0].dropoff);
      }
      onChangeDropoffs?.(reordered);
    },
    [currentStops, onChangeRecipient, onChangeDropoff, onChangeDropoffs]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) handleReorderStops(index, index - 1);
    },
    [handleReorderStops]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < currentStops.length - 1) handleReorderStops(index, index + 1);
    },
    [currentStops.length, handleReorderStops]
  );

  const sortableContainerRef = useSortableList(currentStops.length, handleReorderStops, {
    disabled: !isMultiDrop,
  });

  return {
    currentStops,
    isMultiDrop,
    isBulkModalOpen,
    setIsBulkModalOpen,
    collapsedStops,
    sortableContainerRef,
    handleToggleCollapse,
    handleUpdateStop,
    handleAddStop,
    handleRemoveStop,
    handleBulkApply,
    handleMoveUp,
    handleMoveDown,
  };
}

