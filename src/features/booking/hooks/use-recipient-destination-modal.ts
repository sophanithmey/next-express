'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { RecipientInfo, DropoffLocation, DropoffStop, CodInfo } from '../types/booking-types';
import {
  isDropoffStopDirty,
  seedPerStopCodOnExpand,
  validateDropoffStops,
} from '../services/booking-form-helpers';

interface UseRecipientDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: RecipientInfo;
  dropoff: DropoffLocation;
  dropoffs?: DropoffStop[];
  orderCod?: CodInfo;
  onSaveDestination: (rec: RecipientInfo, drop: DropoffLocation, stops?: DropoffStop[]) => void;
  externalErrors?: Record<string, string>;
  initialStopIndex?: number;
}

/**
 * Manages multi-drop modal tabs, stop edits, dirty-stop delete confirmation,
 * map coordinate sync, and validation before saving and closing the modal.
 */
export function useRecipientDestinationModal({
  isOpen, onClose, recipient, dropoff, dropoffs, orderCod,
  onSaveDestination, externalErrors = {}, initialStopIndex = 0,
}: UseRecipientDestinationModalProps) {
  const tValidation = useTranslations('Validation');
  const [activeTab, setActiveTab] = useState(0);
  const [stops, setStops] = useState<DropoffStop[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const wasOpenRef = useRef(false);

  const clearFieldError = useCallback((stopIdx: number, field: 'phoneNumber' | 'address') => {
    setLocalErrors((prev) => {
      const key = `dropoffs.${stopIdx}.${field}`;
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    const incomingStops =
      dropoffs && dropoffs.length > 0 ? dropoffs : [{ id: 'stop-1', recipient, dropoff }];

    if (isOpen && !wasOpenRef.current) {
      setStops(incomingStops);
      setActiveTab(Math.min(Math.max(0, initialStopIndex), Math.max(0, incomingStops.length - 1)));
      setLocalErrors({});
      setPendingDeleteIndex(null);
    } else if (isOpen && wasOpenRef.current && dropoffs) {
      // Sync address/coordinates picked via Map modal without discarding unsaved recipient edits
      setStops((prev) =>
        prev.map((s, idx) => {
          const incomingDropoff = dropoffs[idx]?.dropoff;
          if (!incomingDropoff) return s;
          if (incomingDropoff.address !== s.dropoff.address) clearFieldError(idx, 'address');
          return { ...s, dropoff: incomingDropoff };
        })
      );
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, dropoffs, recipient, dropoff, initialStopIndex, clearFieldError]);

  const handleUpdateCurrentStop = useCallback(
    (updRecipient: RecipientInfo, updDropoff: DropoffLocation, codAmount?: number) => {
      setStops((prev) =>
        prev.map((s, idx) => {
          if (idx !== activeTab) return s;
          if (updRecipient.phoneNumber !== s.recipient.phoneNumber) clearFieldError(activeTab, 'phoneNumber');
          if (updDropoff.address !== s.dropoff.address) clearFieldError(activeTab, 'address');
          return {
            ...s,
            recipient: updRecipient,
            dropoff: updDropoff,
            ...(codAmount !== undefined ? { codAmount } : {}),
          };
        })
      );
    },
    [activeTab, clearFieldError]
  );

  const handleAddStop = useCallback(() => {
    setStops((prev) => {
      const seededPrev = orderCod ? seedPerStopCodOnExpand(prev, orderCod) : prev;
      const nextIdx = seededPrev.length + 1;
      const newStop: DropoffStop = {
        id: `stop-${Date.now()}`,
        recipient: { name: '', phoneNumber: '', notes: '' },
        dropoff: {
          address: '',
          coordinates: { lat: 11.5512 + nextIdx * 0.005, lng: 104.9256 + nextIdx * 0.005 },
        },
        codAmount: 0,
      };
      const nextStops = [...seededPrev, newStop];
      setActiveTab(nextStops.length - 1);
      return nextStops;
    });
  }, [orderCod]);

  const executeRemoveStop = useCallback((idxToRemove: number) => {
    setStops((prev) => {
      if (prev.length <= 1) return prev;
      const nextStops = prev.filter((_, idx) => idx !== idxToRemove);
      setActiveTab((tab) =>
        tab > idxToRemove ? tab - 1 : Math.min(tab, nextStops.length - 1)
      );
      setLocalErrors({});
      return nextStops;
    });
  }, []);

  const requestRemoveStop = useCallback(
    (idxToRemove: number) => {
      if (stops.length <= 1) return;
      const target = stops[idxToRemove];
      if (target && isDropoffStopDirty(target)) {
        setPendingDeleteIndex(idxToRemove);
        return;
      }
      executeRemoveStop(idxToRemove);
    },
    [stops, executeRemoveStop]
  );

  const confirmRemoveStop = useCallback(() => {
    if (pendingDeleteIndex === null) return;
    executeRemoveStop(pendingDeleteIndex);
    setPendingDeleteIndex(null);
  }, [pendingDeleteIndex, executeRemoveStop]);

  const cancelRemoveStop = useCallback(() => setPendingDeleteIndex(null), []);

  const handleApplyBulkStops = useCallback((bulk: DropoffStop[]) => {
    setStops(bulk);
    setActiveTab(0);
    setLocalErrors({});
    setPendingDeleteIndex(null);
  }, []);

  const validationMessages = useMemo(
    () => ({
      phoneRequired: () => tValidation('recipientPhoneRequired'),
      phoneInvalid: () => tValidation('recipientPhoneInvalid'),
      addressRequired: () => tValidation('dropoffAddressRequired'),
    }),
    [tValidation]
  );

  const handleSave = useCallback(() => {
    const validationErrors = validateDropoffStops(stops, validationMessages);
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      const currentHasError =
        Boolean(validationErrors[`dropoffs.${activeTab}.phoneNumber`]) ||
        Boolean(validationErrors[`dropoffs.${activeTab}.address`]);

      if (!currentHasError) {
        const firstInvalidIdx = stops.findIndex(
          (_, idx) =>
            Boolean(validationErrors[`dropoffs.${idx}.phoneNumber`]) ||
            Boolean(validationErrors[`dropoffs.${idx}.address`])
        );
        if (firstInvalidIdx >= 0) setActiveTab(firstInvalidIdx);
      }
      return;
    }

    setLocalErrors({});
    const primary = stops[0];
    onSaveDestination(primary.recipient, primary.dropoff, stops);
    onClose();
  }, [stops, activeTab, validationMessages, onSaveDestination, onClose]);

  const mergedErrors = useMemo(
    () => ({ ...externalErrors, ...localErrors }),
    [externalErrors, localErrors]
  );

  const hasStopError = useCallback(
    (idx: number) =>
      Boolean(
        mergedErrors[`dropoffs.${idx}.phoneNumber`] ||
          mergedErrors[`dropoffs.${idx}.address`] ||
          mergedErrors[`dropoffs.${idx}.codAmount`] ||
          (idx === 0 && (mergedErrors['recipient.phoneNumber'] || mergedErrors['dropoff.address']))
      ),
    [mergedErrors]
  );

  const pendingDeleteStop = pendingDeleteIndex !== null ? stops[pendingDeleteIndex] || null : null;
  const pendingDeletePreview =
    pendingDeleteStop?.recipient?.name?.trim() ||
    pendingDeleteStop?.dropoff?.address?.trim() ||
    pendingDeleteStop?.recipient?.phoneNumber?.trim() ||
    undefined;

  return {
    activeTab, setActiveTab, stops, currentStop: stops[activeTab] || stops[0],
    isBulkModalOpen, setIsBulkModalOpen, mergedErrors, hasStopError,
    pendingDeleteIndex, pendingDeletePreview,
    handleUpdateCurrentStop, handleAddStop,
    requestRemoveStop, confirmRemoveStop, cancelRemoveStop,
    handleApplyBulkStops, handleSave,
  };
}
