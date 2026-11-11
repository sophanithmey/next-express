'use client';

import React from 'react';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { PickupFields } from '../molecules/pickup-fields';
import { usePickupDetailsModal } from '@/features/booking/hooks/use-pickup-details-modal';
import { Button } from '../atoms/button';
import { X, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PickupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: PickupLocation;
  onSavePickup: (pickup: PickupLocation) => void;
  onOpenMap: () => void;
  savedLocations?: (PickupLocation & { tag?: string })[];
  error?: string;
  phoneError?: string;
}

export function PickupDetailsModal({
  isOpen,
  onClose,
  pickup,
  onSavePickup,
  onOpenMap,
  savedLocations,
  error,
  phoneError,
}: PickupDetailsModalProps) {
  const tPickup = useTranslations('Pickup');
  const tCommon = useTranslations('Common');

  const {
    draft,
    handleChangeDraft,
    isLocating,
    handleGetCurrentLocation,
    localErrors,
    handleSave,
  } = usePickupDetailsModal(isOpen, pickup, onSavePickup, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl sm:max-w-xl lg:max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {tPickup('modalTitleHorizontal')}
            </h3>
            <p className="text-xs text-slate-500">
              {tPickup('modalSubtitleHorizontal')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <PickupFields
            idPrefix="modal-pickup"
            pickup={draft}
            onChange={handleChangeDraft}
            onOpenMap={onOpenMap}
            onUseCurrentLocation={handleGetCurrentLocation}
            isLocating={isLocating}
            savedLocations={savedLocations}
            addressError={localErrors.address || error}
            phoneError={localErrors.senderPhone || phoneError}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/70">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Check className="h-4 w-4" />}
          >
            {tPickup('savePickupButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
