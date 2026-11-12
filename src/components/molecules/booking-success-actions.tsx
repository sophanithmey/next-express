'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, ExternalLink, FileText, Lock, Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { CancelOrderModal } from './cancel-order-modal';

interface BookingSuccessActionsProps {
  bookingId?: string;
  tracking: string;
  paymentRedirectUrl?: string | null;
  canCancel: boolean;
  isCancelled: boolean;
  isCancelModalOpen: boolean;
  onOpenCancelModal: () => void;
  onCloseCancelModal: () => void;
  onConfirmCancel: (reason?: string) => void;
  isCancelling: boolean;
  cancelError: string | null;
}

export function BookingSuccessActions({
  bookingId,
  tracking,
  paymentRedirectUrl,
  canCancel,
  isCancelled,
  isCancelModalOpen,
  onOpenCancelModal,
  onCloseCancelModal,
  onConfirmCancel,
  isCancelling,
  cancelError,
}: BookingSuccessActionsProps) {
  const tPayment = useTranslations('Payment');

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        {paymentRedirectUrl && !isCancelled && (
          <a
            href={paymentRedirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-400 transition shadow-xs"
          >
            <span>Complete Payment</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <div className="flex flex-col gap-2.5">
          <Link href="/booking" className="w-full">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full min-h-11 bg-secondary-600 hover:bg-secondary-700 shadow-sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {tPayment('bookAnother')}
            </Button>
          </Link>

          <Link
            href={`/bookings/${encodeURIComponent(bookingId || tracking)}`}
            className="w-full"
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full min-h-11 border-secondary-200 text-secondary-700 hover:bg-secondary-50/70"
              leftIcon={<FileText className="h-4 w-4" />}
            >
              {tPayment('viewBookingDetails')}
            </Button>
          </Link>

          <Link
            href="/bookings"
            className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <span>{tPayment('viewAll')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Cancel Section — Subtle low-emphasis action so primary CTAs stand out */}
        {!isCancelled && (
          <div className="border-t border-slate-100 pt-2.5">
            {canCancel ? (
              <div className="space-y-1 text-center">
                <button
                  type="button"
                  onClick={onOpenCancelModal}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50/80 transition cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{tPayment('cancelOrder')}</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  {tPayment('cancelHint')}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{tPayment('cancelDisabledNote')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        tracking={tracking}
        isCancelling={isCancelling}
        cancelError={cancelError}
        onClose={onCloseCancelModal}
        onConfirm={onConfirmCancel}
      />
    </>
  );
}
