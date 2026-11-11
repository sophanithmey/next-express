'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/atoms/button';

interface DeleteStopConfirmModalProps {
  isOpen: boolean;
  stopNumber: number;
  stopPreview?: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation alert shown before deleting a multi-drop stop that contains user data.
 */
export function DeleteStopConfirmModal({
  isOpen,
  stopNumber,
  stopPreview,
  onClose,
  onConfirm,
}: DeleteStopConfirmModalProps) {
  const tBooking = useTranslations('Booking');
  const tCommon = useTranslations('Common');

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-stop-title"
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-50 text-danger-600 border border-danger-100">
            <Trash2 className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 id="delete-stop-title" className="text-base font-bold text-slate-900">
            {tBooking('deleteStopConfirmTitle', { number: stopNumber })}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {stopPreview
              ? tBooking('deleteStopConfirmDesc', {
                  number: stopNumber,
                  preview: stopPreview,
                })
              : tBooking('deleteStopConfirmDescNoPreview', { number: stopNumber })}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4 cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-xl px-4 shadow-xs cursor-pointer"
          >
            {tBooking('deleteStopConfirmButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}

