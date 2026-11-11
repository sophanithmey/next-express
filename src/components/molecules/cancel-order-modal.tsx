'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, PackageX, ShieldCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

interface CancelOrderModalProps {
  isOpen: boolean;
  tracking: string;
  isCancelling: boolean;
  cancelError: string | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function CancelOrderModal({
  isOpen,
  tracking,
  isCancelling,
  cancelError,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const tPayment = useTranslations('Payment');
  const [selectedReason, setSelectedReason] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const reasonOptions = [
    tPayment('reasonChangedMind'),
    tPayment('reasonWrongInfo'),
    tPayment('reasonBuyerCancelled'),
    tPayment('reasonWaitTime'),
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-danger-100 bg-danger-50 text-danger-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="cancel-modal-title"
                className="text-base font-extrabold text-slate-900"
              >
                {tPayment('cancelModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {tPayment('trackingRef')}:{' '}
                <span className="font-mono font-bold text-slate-700">{tracking}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tracking & Free Refund Summary Box */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <PackageX className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="font-mono text-xs font-bold text-slate-800 truncate">
              {tracking}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2.5 py-0.5 text-xs font-bold text-success-700">
            <ShieldCheck className="h-3 w-3" />
            <span>{tPayment('cancelRefundBadge')}</span>
          </span>
        </div>

        {/* Reassurance Copy */}
        <p className="text-xs leading-relaxed text-slate-600">
          {tPayment('cancelModalDesc')}
        </p>

        {/* Optional Quick Reason Chips */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            {tPayment('cancelReasonLabel')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {reasonOptions.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(isSelected ? '' : reason)}
                  className={cn(
                    'min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-medium transition',
                    isSelected
                      ? 'border-danger-300 bg-danger-50 text-danger-800 font-semibold ring-1 ring-danger-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline API Error */}
        {cancelError && (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-medium text-danger-700">
            {cancelError}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isCancelling}
            className="w-full min-h-11 rounded-xl"
          >
            {tPayment('keepOrder')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => onConfirm(selectedReason || undefined)}
            isLoading={isCancelling}
            className="w-full min-h-11 rounded-xl font-bold shadow-sm shadow-danger-500/20"
          >
            {isCancelling ? tPayment('cancelling') : tPayment('confirmCancel')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

