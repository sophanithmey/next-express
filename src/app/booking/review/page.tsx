'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Banknote, ArrowRight } from 'lucide-react';
import { BookingFormData, BookingFeeQuote } from '@/features/booking/types/booking-types';
import { loadBookingDraft, clearBookingDraft } from '@/features/booking/services/booking-draft-service';
import { calculateMockFee, generateMockReference, generateMockTracking } from '@/features/booking/data/mock-booking-data';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { UserProfile } from '@/features/auth/types/auth-types';
import { PublicHeader } from '@/components/organisms/public-header';
import { BookingReviewSummary } from '@/components/organisms/booking-review-summary';
import { PaymentMethodSelector, PaymentMethodType } from '@/components/organisms/payment-method-selector';
import { AuthenticationModal } from '@/components/organisms/authentication-modal';
import { Button } from '@/components/atoms/button';
import { APP_CONFIG } from '@/lib/constants';

export default function BookingReviewPage() {
  const router = useRouter();
  const { isAuthenticated, user, login } = useAuthState();
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('khqr');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft || !draft.pickup.address) {
      router.replace('/');
      return;
    }
    setFormData(draft);
  }, [router]);

  if (!formData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Loading booking review…
      </div>
    );
  }

  const additionalStops = Math.max(0, (formData.dropoffs?.length || 1) - 1);
  const feeQuote: BookingFeeQuote = calculateMockFee(
    formData.pickup.coordinates,
    formData.dropoff.coordinates,
    additionalStops
  );
  const totalFee = feeQuote.totalDeliveryFee;

  const handleFinalPayment = async () => {
    setIsPaying(true);
    await new Promise((r) => setTimeout(r, 900));

    const ref = generateMockReference();
    const tracking = generateMockTracking();
    const stopsCount = formData.dropoffs?.length || 1;
    const dropoffSummary =
      stopsCount > 1
        ? `${formData.dropoff.address} (+${stopsCount - 1} more)`
        : formData.dropoff.address;

    const query = new URLSearchParams({
      ref,
      tracking,
      pickup: formData.pickup.name || formData.pickup.address,
      dropoff: dropoffSummary,
      recipient: formData.recipient.name || 'Recipient',
      stops: String(stopsCount),
      cod: formData.cod.isCod ? String(formData.cod.amount) : '0',
      payment: selectedPayment.toUpperCase(),
      fee: String(totalFee),
    });

    // Background sync
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, paymentMethod: selectedPayment }),
    }).catch(() => {});

    clearBookingDraft();
    setIsPaying(false);
    router.push(`/booking/success?${query.toString()}`);
  };

  const handlePayClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      handleFinalPayment();
    }
  };

  const handleAuthSuccess = (authUser: UserProfile) => {
    login(authUser);
    setIsAuthModalOpen(false);
    handleFinalPayment();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Edit Booking</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>1. Booking Details</span>
            <span>→</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              2. Review &amp; Payment
            </span>
            <span>→</span>
            <span>3. Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Review Summary & Payment Selection */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <BookingReviewSummary formData={formData} />
            <PaymentMethodSelector
              selectedMethod={selectedPayment}
              onSelectMethod={setSelectedPayment}
              deliveryFee={totalFee}
            />
          </div>

          {/* Right Column: Sticky Payment Confirmation Card */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Summary
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono block mt-0.5">
                  {APP_CONFIG.currencySymbol}{totalFee.toFixed(2)} USD
                </span>
              </div>

              {/* Itemized Fee Breakdown */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Delivery Fee (Stop 1)</span>
                  <span className="font-mono text-slate-900 font-semibold">{APP_CONFIG.currencySymbol}1.25</span>
                </div>
                {additionalStops > 0 && (
                  <div className="flex justify-between">
                    <span>+{additionalStops} Additional Drop-off Stop{additionalStops > 1 ? 's' : ''}</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      +{APP_CONFIG.currencySymbol}{(additionalStops * 0.75).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Fuel &amp; Distance Surcharge</span>
                  <span className="font-mono">Included</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Delivery Charge</span>
                  <span className="font-mono text-emerald-800">
                    {APP_CONFIG.currencySymbol}{totalFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* COD Remittance Callout */}
              {formData.cod.isCod && formData.cod.amount > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                      <span>COD to Collect from Buyer:</span>
                    </span>
                    <span className="font-mono text-sm">{APP_CONFIG.currencySymbol}{formData.cod.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-tight">
                    Collected by courier and remitted to your seller wallet. Not added to delivery cost.
                  </p>
                </div>
              )}

              {/* Security & Action */}
              <div className="pt-2 space-y-2.5">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handlePayClick}
                  isLoading={isPaying}
                  className="w-full py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  {isAuthenticated
                    ? `Pay ${APP_CONFIG.currencySymbol}${totalFee.toFixed(2)} & Dispatch`
                    : `Confirm & Pay ${APP_CONFIG.currencySymbol}${totalFee.toFixed(2)}`}
                </Button>

                <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Secure 256-bit encrypted checkout</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

