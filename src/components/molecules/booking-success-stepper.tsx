'use client';

import React from 'react';
import { Check, Bike, PackageCheck, Navigation, Clock, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface BookingSuccessStepperProps {
  /** 0 = confirmed, 1 = assigning/assigned, 2 = out_for_delivery, 3 = delivered */
  activeStep?: number;
  etaLabel?: string;
  isCancelled?: boolean;
}

export function BookingSuccessStepper({
  activeStep = 1,
  etaLabel,
  isCancelled = false,
}: BookingSuccessStepperProps) {
  const tPayment = useTranslations('Payment');

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-danger-200 bg-danger-50/80 p-4 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-danger-900">{tPayment('cancelledTitle')}</p>
          <p className="text-danger-700 leading-relaxed">{tPayment('cancelledSubtitle')}</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'confirmed', label: tPayment('stepConfirmed'), Icon: Check },
    { key: 'assigning', label: tPayment('stepAssigning'), Icon: Bike },
    { key: 'transit', label: tPayment('stepTransit'), Icon: Navigation },
    { key: 'delivered', label: tPayment('stepDelivered'), Icon: PackageCheck },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-4">
      {etaLabel && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 border border-secondary-200/80 px-2.5 py-1 text-secondary-800 font-semibold">
            <span className="h-2 w-2 rounded-full bg-secondary-600 animate-pulse" />
            <span>{etaLabel}</span>
          </div>
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>
      )}

      <div className="relative grid grid-cols-4 gap-2">
        {/* Progress bar track */}
        <div
          aria-hidden="true"
          className="absolute top-4 inset-x-0 mx-auto h-0.5 w-3/4 bg-slate-200"
        >
          <div
            className="h-full bg-success-500 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, (activeStep / (steps.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {steps.map(({ key, label, Icon }, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <div key={key} className="relative z-10 flex flex-col items-center text-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted &&
                    'border-success-500 bg-success-500 text-white shadow-xs',
                  isCurrent &&
                    'border-secondary-600 bg-white text-secondary-700 ring-4 ring-secondary-100 shadow-xs',
                  !isCompleted &&
                    !isCurrent &&
                    'border-slate-200 bg-white text-slate-400'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  'text-xs leading-tight font-medium',
                  isCurrent
                    ? 'text-secondary-900 font-bold'
                    : isCompleted
                    ? 'text-slate-700 font-semibold'
                    : 'text-slate-400'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
