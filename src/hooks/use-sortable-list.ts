'use client';

import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

interface UseSortableListOptions {
  handle?: string;
  animation?: number;
  ghostClass?: string;
  chosenClass?: string;
  dragClass?: string;
  filter?: string;
  preventOnFilter?: boolean;
  delay?: number;
  delayOnTouchOnly?: boolean;
  disabled?: boolean;
}

/**
 * Reusable hook integrating SortableJS with React state as the single source of truth.
 * Automatically reverts Sortable's DOM manipulation before dispatching the React state
 * update, preventing virtual DOM reconciliation conflicts or duplicate nodes.
 */
export function useSortableList(
  itemCount: number,
  onReorder: (oldIndex: number, newIndex: number) => void,
  options: UseSortableListOptions = {}
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const {
    handle = '.drag-handle',
    animation = 200,
    ghostClass = 'sortable-ghost',
    chosenClass = 'sortable-chosen',
    dragClass = 'sortable-drag',
    filter = 'button, a, input, select, textarea, .no-drag',
    preventOnFilter = false,
    delay = 120,
    delayOnTouchOnly = true,
    disabled = false,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled || typeof window === 'undefined') return;

    // Destroy existing instance on this DOM node if already initialized (Strict Mode guard)
    const existing = Sortable.get(container);
    if (existing) {
      existing.destroy();
    }

    const sortable = new Sortable(container, {
      handle,
      animation,
      ghostClass,
      chosenClass,
      dragClass,
      filter,
      preventOnFilter,
      delay,
      delayOnTouchOnly,
      touchStartThreshold: 3,
      fallbackTolerance: 3,
      onEnd: (evt) => {
        const { oldIndex, newIndex, from, item } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        ) {
          return;
        }

        // Revert SortableJS physical DOM move so React can perform clean DOM reconciliation
        if (from && item) {
          from.removeChild(item);
          const referenceNode = from.children[oldIndex] || null;
          from.insertBefore(item, referenceNode);
        }

        // Notify React to reorder state
        onReorderRef.current(oldIndex, newIndex);
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [
    itemCount,
    disabled,
    handle,
    animation,
    ghostClass,
    chosenClass,
    dragClass,
    filter,
    preventOnFilter,
    delay,
    delayOnTouchOnly,
  ]);

  return containerRef;
}

