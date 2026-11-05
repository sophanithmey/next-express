import React from 'react';
import { Button } from '../atoms/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface BookingActionBarProps {
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
  estimatedFee?: number;
  showBack?: boolean;
  submitLabel?: string;
}

export function BookingActionBar({
  currentStep = 1,
  totalSteps = 1,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  canProceed = true,
  estimatedFee,
  showBack = true,
  submitLabel = 'Confirm & Book Delivery',
}: BookingActionBarProps) {
  const isLastStep = currentStep === totalSteps;
  const shouldShowBack = showBack && typeof onBack === 'function';

  return (
    <div className="sticky bottom-4 z-40 mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 px-5 sm:px-6 py-3.5 backdrop-blur-md shadow-lg sm:shadow-xl transition-all">
        {/* Left Side: Back Button & Estimated Fee */}
        <div className="flex items-center gap-4 sm:gap-6">
          {shouldShowBack && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={isSubmitting}
              leftIcon={<ArrowLeft className="h-4 w-4 text-slate-600" />}
              className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100"
            >
              Back
            </Button>
          )}

          {typeof estimatedFee === 'number' && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-lg sm:text-2xl font-bold text-brand-700 font-mono tracking-tight leading-none block mt-0.5">
                {APP_CONFIG.currencySymbol}
                {estimatedFee.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Primary Action Button */}
        <div className="flex items-center gap-3">
          {isLastStep || !onNext ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onSubmit}
              isLoading={isSubmitting}
              disabled={!canProceed || isSubmitting}
              leftIcon={<Check className="h-4 w-4" />}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 shadow-md hover:shadow-lg transition-all"
            >
              {submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onNext}
              disabled={!canProceed}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

