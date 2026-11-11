'use client';

import React from 'react';
import { ArrowRight, Banknote, CheckCircle2, Heart, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { UserProfile } from '@/features/auth/types/auth-types';
import { APP_CONFIG } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { PaymentMethodType } from './payment-method-selector';
import { WING_POINTS_RATE } from '../molecules/payment-method-details';
import { normalizePaymentKind } from '@/features/payment/utils/payment-provider-helpers';

interface BookingPaymentCardProps {
  totalFee: number;
  discountAmount?: number;
  tipAmount?: number;
  appliedPromoCode?: string;
  selectedPayment?: PaymentMethodType;
  additionalStops: number;
  isCod: boolean;
  codAmount: number;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isPaying: boolean;
  onConfirmPayment: () => void;
}

export function BookingPaymentCard({
  totalFee,
  discountAmount = 0,
  tipAmount = 0,
  appliedPromoCode,
  selectedPayment = 'khqr',
  additionalStops,
  isCod,
  codAmount,
  isAuthenticated,
  user,
  isPaying,
  onConfirmPayment,
}: BookingPaymentCardProps) {
  const tPayment = useTranslations('Payment');
  const stopOneFee = Math.max(0, totalFee - additionalStops * 0.75);
  const discountedFee = Math.max(0, totalFee - discountAmount);
  const netPayable = discountedFee + tipAmount;
  const pointsRequired = Math.round(netPayable * WING_POINTS_RATE);
  const paymentKind = normalizePaymentKind(selectedPayment);

  const getButtonText = () => {
    if (isPaying) return tPayment('paying');
    if (paymentKind === 'wingpoint') {
      return tPayment('payWithPointsButton', { points: pointsRequired.toLocaleString() });
    }
    if (paymentKind === 'khqr') {
      return tPayment('scanKhqrButton');
    }
    return tPayment('confirmPay');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-slate-700 block">
          {tPayment('paymentSummaryTitle')}
        </span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-black text-slate-900 font-mono">
            {APP_CONFIG.currencySymbol}{netPayable.toFixed(2)} USD
          </span>
          {discountAmount > 0 && (
            <span className="text-xs font-mono text-slate-400 line-through">
              ${(totalFee + tipAmount).toFixed(2)}
            </span>
          )}
        </div>
        {paymentKind === 'wingpoint' && (
          <span className="text-xs font-semibold text-amber-700 font-mono block mt-0.5">
            {tPayment('approxWingPoints', { points: pointsRequired.toLocaleString() })}
          </span>
        )}
      </div>

      {/* Itemized Fee Breakdown */}
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>{tPayment('baseDeliveryFeeStop1')}</span>
          <span className="font-mono text-slate-900 font-semibold">
            {APP_CONFIG.currencySymbol}{stopOneFee.toFixed(2)}
          </span>
        </div>
        {additionalStops > 0 && (
          <div className="flex justify-between">
            <span>{tPayment('additionalStopsRow', { count: additionalStops })}</span>
            <span className="font-mono text-slate-900 font-semibold">
              +{APP_CONFIG.currencySymbol}{(additionalStops * 0.75).toFixed(2)}
            </span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-success-700 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{tPayment('promoVoucherRow', { code: appliedPromoCode || '' })}</span>
            </span>
            <span className="font-mono font-bold">
              -{APP_CONFIG.currencySymbol}{discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        {tipAmount > 0 && (
          <div className="flex justify-between text-amber-700 font-medium">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              <span>{tPayment('riderTipRow')}</span>
            </span>
            <span className="font-mono font-bold">
              +{APP_CONFIG.currencySymbol}{tipAmount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm text-slate-900">
          <span>{tPayment('totalAmountPayable')}</span>
          <span className="font-mono text-secondary-800">
            {APP_CONFIG.currencySymbol}{netPayable.toFixed(2)}
          </span>
        </div>
      </div>

      {/* COD Remittance Callout */}
      {isCod && codAmount > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-3 text-xs text-primary-950 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-primary-700" />
              <span>{tPayment('codCollectFromBuyerTitle')}</span>
            </span>
            <span className="font-mono text-sm">{APP_CONFIG.currencySymbol}{codAmount.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-primary-800 leading-tight">
            {tPayment('codCollectDisclaimer')}
          </p>
        </div>
      )}

      {/* Verified Seller Status Banner */}
      {isAuthenticated && user && (
        <div className="rounded-xl border border-success-200 bg-success-50/70 p-3 text-xs text-success-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0" />
            <div>
              <span className="font-bold block leading-tight">
                {user.shopName || user.name || tPayment('verifiedSeller')}
              </span>
              <span className="text-[10px] text-success-700 font-mono">{user.phoneNumber}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-full uppercase">
            {tPayment('authenticatedBadge')}
          </span>
        </div>
      )}

      {/* Action CTA */}
      <div className="pt-2 space-y-2.5">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onConfirmPayment}
          isLoading={isPaying}
          className="w-full py-4 text-base font-bold bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          {getButtonText()}
        </Button>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
          <span>
            {isAuthenticated
              ? tPayment('readyToDispatchNote')
              : tPayment('signInToConfirmNote')}
          </span>
        </p>
      </div>
    </div>
  );
}
