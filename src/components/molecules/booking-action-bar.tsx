import React from 'react';
import { Button } from '../atoms/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface BookingActionBarProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
  estimatedFee?: number;
}

export function BookingActionBar({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  canProceed = true,
  estimatedFee,
}: BookingActionBarProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="sticky bottom-0 z-40 -mx-4 -mb-4 mt-8 flex items-center justify-between border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md sm:mx-0 sm:mb-0 sm:rounded-2xl sm:border sm:shadow-lg">
      <div className="flex items-center gap-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            disabled={isSubmitting}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        )}

        {typeof estimatedFee === 'number' && (
          <div className="hidden sm:block">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Estimated Delivery
            </span>
            <span className="text-base font-bold text-brand-700">
              {APP_CONFIG.currencySymbol}
              {estimatedFee.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isLastStep ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Confirm & Book Delivery
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
  );
}

