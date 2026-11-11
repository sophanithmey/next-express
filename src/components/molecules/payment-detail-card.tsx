'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PaymentDetailRecord } from '@/features/payment/types/payment-types';

interface PaymentDetailCardProps {
  detail: PaymentDetailRecord | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function getStatusPillStyle(status: string): string {
  const upper = status.toUpperCase();
  if (upper === 'PAID' || upper === 'SUCCESS' || upper === 'COMPLETED') {
    return 'border-success-200 bg-success-50 text-success-800';
  }
  if (upper === 'FAILED' || upper === 'CANCELLED') {
    return 'border-danger-200 bg-danger-50 text-danger-700';
  }
  return 'border-warning-200 bg-warning-50 text-warning-800';
}

export function PaymentDetailCard({
  detail,
  isLoading = false,
  onRefresh,
}: PaymentDetailCardProps) {
  const t = useTranslations('Payment');
  if (!detail && !isLoading) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-secondary-600" />
          <span>{t('paymentVerificationTitle')}</span>
        </span>
        <div className="flex items-center gap-2">
          {detail && (
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                getStatusPillStyle(detail.paymentStatus),
              )}
            >
              {detail.paymentStatus}
            </span>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
              <span>{t('refreshPaymentStatus')}</span>
            </button>
          )}
        </div>
      </div>

      {detail && (
        <>
          <div className="flex items-center justify-between text-slate-600">
            <span>{t('paidAmountLabel')}</span>
            <span className="font-mono font-bold text-slate-900">
              {detail.paidAmount} / {detail.totalAmount} {detail.currency}
            </span>
          </div>

          {detail.transactions.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('transactionsLabel')} ({detail.transactions.length})
              </span>
              {detail.transactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-lg bg-slate-50 px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-semibold text-slate-800 block truncate">
                      {tx.coreReference || tx.internalReference || tx.id}
                    </span>
                    {tx.paymentType && (
                      <span className="text-[10px] text-slate-500">
                        {tx.paymentType}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-900 block">
                      {tx.amount} {tx.currency}
                    </span>
                    {tx.transactionStatus && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {tx.transactionStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

