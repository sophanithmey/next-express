'use client';

import React from 'react';
import { ArrowLeft, Check, Headphones, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../atoms/button';
import { AuthPinBoxes } from './auth-pin-boxes';
import { useAuthPinStep } from '@/features/auth/hooks/use-auth-pin-step';
import { APP_CONFIG } from '@/lib/constants';

interface AuthPinStepProps {
  phone: string;
  pin: string;
  onChangePin: (val: string) => void;
  onVerify: (pin: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

export function AuthPinStep({
  phone,
  pin,
  onChangePin,
  onVerify,
  onBack,
  isLoading,
  error,
}: AuthPinStepProps) {
  const t = useTranslations('Authentication');
  const {
    inputRef,
    maskedPhone,
    focusInput,
    handleInputChange,
    handleKeyDown,
  } = useAuthPinStep({
    phone,
    pin,
    isLoading,
    onChangePin,
    onVerify,
  });

  return (
    <div className='space-y-6 text-center'>
      {/* Header Info */}
      <div className='space-y-2'>
        <div className='inline-flex items-center gap-1.5 rounded-full bg-secondary-50 border border-secondary-200/80 px-3 py-1 text-xs font-bold text-secondary-800'>
          <ShieldCheck className='h-3.5 w-3.5 text-secondary-600' />
          <span>Security Verification</span>
        </div>
        <h3 className='text-2xl font-black text-slate-900 tracking-tight'>
          {t('enterPin')}
        </h3>
        <p className='text-sm text-slate-500'>
          {t('pinSentTo', { phone: maskedPhone })}{' '}
          <button
            type='button'
            onClick={onBack}
            className='font-bold text-secondary-600 hover:text-secondary-800 underline underline-offset-2 ml-1 cursor-pointer transition'
          >
            {t('changePhone')}
          </button>
        </p>
      </div>

      {/* 4-Box Segmented PIN Display */}
      <div className='space-y-3'>
        <AuthPinBoxes pin={pin} onClick={focusInput} />

        {/* Hidden accessible input that captures keyboard, paste, and auto-submit */}
        <input
          ref={inputRef}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={4}
          value={pin}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className='sr-only'
          autoComplete='one-time-code'
          aria-label='4-digit PIN'
        />
      </div>

      {/* Inline Error */}
      {error && (
        <div className='rounded-xl border border-danger-200 bg-danger-50 p-3 text-xs font-medium text-danger-700 animate-in fade-in'>
          {error}
        </div>
      )}

      {/* Verify Primary CTA */}
      <Button
        type='button'
        variant='primary'
        size='lg'
        onClick={() => onVerify(pin)}
        isLoading={isLoading}
        disabled={isLoading}
        className='w-full py-4.5 text-base font-bold bg-secondary-600 hover:bg-secondary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2'
        leftIcon={<Check className='h-4.5 w-4.5' />}
      >
        {isLoading ? t('verifying') : t('verifyButton')}
      </Button>

      {/* Footer Navigation: Back & Support */}
      <div className='flex flex-wrap items-center justify-between gap-2 text-xs pt-1'>
        <button
          type='button'
          onClick={onBack}
          disabled={isLoading}
          className='text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer'
        >
          <ArrowLeft className='h-3.5 w-3.5 shrink-0' />
          <span>Back to phone</span>
        </button>

        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className='font-bold text-secondary-600 hover:text-secondary-800 flex items-center gap-1.5 transition'
        >
          <Headphones className='h-3.5 w-3.5 shrink-0' />
          <span>{t('havingTroubleSupport')}</span>
        </a>
      </div>
    </div>
  );
}
