'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBookingReview } from '@/features/booking/hooks/use-booking-review';
import { BookingReviewSummary } from '@/components/organisms/booking-review-summary';
import { PaymentMethodSelector } from '@/components/organisms/payment-method-selector';
import { BookingPaymentCard } from '@/components/organisms/booking-payment-card';
import { PromoCodeInput } from '@/components/molecules/promo-code-input';
import { RiderTipSelector } from '@/components/molecules/rider-tip-selector';

export default function BookingReviewPage() {
  const tPayment = useTranslations('Payment');
  const tCommon = useTranslations('Common');
  const {
    formData,
    isAuthenticated,
    user,
    selectedPayment,
    setSelectedPayment,
    paymentOptions,
    isLoadingOptions,
    paymentCardsState,
    openAuthModal,
    handleAddCard,
    isPaying,
    appliedPromo,
    discountAmount,
    tipAmount,
    setTipAmount,
    additionalStops,
    totalFee,
    netPayableFee,
    handleApplyPromo,
    handleRemovePromo,
    handlePayClick,
  } = useBookingReview();

  if (!formData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        {tPayment('loadingReview')}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/60 flex flex-col antialiased font-sans">
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl w-full space-y-6">
          {/* Navigation Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/booking"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-secondary-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{tCommon('back')}</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>1. {tCommon('details')}</span>
              <span>→</span>
              <span className="font-bold text-secondary-800 bg-secondary-50 px-2.5 py-1 rounded-lg border border-secondary-200">
                2. {tPayment('reviewTitle')}
              </span>
              <span>→</span>
              <span>3. {tCommon('confirm')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: Unified Itinerary, Promo, Tip & Payment Selection */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <BookingReviewSummary formData={formData} />

              <PromoCodeInput
                currentFee={totalFee}
                appliedPromo={appliedPromo}
                discountAmount={discountAmount}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
              />

              <RiderTipSelector
                tipAmount={tipAmount}
                onChangeTip={setTipAmount}
              />

              <PaymentMethodSelector
                selectedMethod={selectedPayment}
                onSelectMethod={setSelectedPayment}
                deliveryFee={netPayableFee}
                apiOptions={paymentOptions}
                isLoadingOptions={isLoadingOptions}
                cards={paymentCardsState.cards}
                selectedCardId={paymentCardsState.selectedCardId}
                isAuthenticated={isAuthenticated}
                isLoadingCards={paymentCardsState.isLoadingCards}
                isMutatingCard={paymentCardsState.isMutatingCard}
                onSelectCard={paymentCardsState.setSelectedCardId}
                onAddCard={handleAddCard}
                onRefreshCards={paymentCardsState.refreshCards}
                onSetDefaultCard={paymentCardsState.setDefaultCard}
                onDeleteCard={paymentCardsState.deleteCard}
                onRequestAuth={() => openAuthModal()}
              />
            </div>

            {/* Right Column: Sticky Summary & Confirmation Card */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
              <BookingPaymentCard
                totalFee={totalFee}
                discountAmount={discountAmount}
                tipAmount={tipAmount}
                appliedPromoCode={appliedPromo?.code}
                selectedPayment={selectedPayment}
                additionalStops={additionalStops}
                isCod={formData.cod.isCod}
                codAmount={formData.cod.amount}
                isAuthenticated={isAuthenticated}
                user={user}
                isPaying={isPaying}
                onConfirmPayment={handlePayClick}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
