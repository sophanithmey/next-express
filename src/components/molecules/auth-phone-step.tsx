'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../atoms/button';
import { PhoneInput } from './phone-input';

interface AuthPhoneStepProps {
  phone: string;
  onChangePhone: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
}

export function AuthPhoneStep({
  phone,
  onChangePhone,
  onSubmit,
  isLoading,
  error,
}: AuthPhoneStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Authentication');

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header Info */}
      <div className='space-y-2 text-center'>
        <h3 className='text-2xl font-black text-slate-900 tracking-tight'>
          {t('loginToContinue')}
        </h3>
        <p className='text-sm text-slate-500 max-w-sm mx-auto leading-relaxed'>
          {t('verifyPhoneSubtitle')}
        </p>
      </div>

      {/* Phone Field & Quick Demo Autofill */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <label
            htmlFor='seller-phone'
            className='text-xs font-bold uppercase tracking-wider text-slate-600'
          >
            {t('phoneLabel')} <span className='text-danger-500'>*</span>
          </label>
        </div>

        <PhoneInput
          id='seller-phone'
          ref={inputRef}
          label=''
          required
          placeholder='012 888 999'
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSubmit()}
          disabled={isLoading}
          sizeVariant='lg'
        />

      </div>

      {/* Inline Error */}
      {error && (
        <div className='rounded-xl border border-danger-200 bg-danger-50 p-3 text-xs font-medium text-danger-700 animate-in fade-in'>
          {error}
        </div>
      )}

      {/* Continue CTA Button */}
      <Button
        type='button'
        variant='primary'
        size='lg'
        onClick={onSubmit}
        isLoading={isLoading}
        className='w-full py-4.5 text-base font-bold bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2'
        rightIcon={<ArrowRight className='h-4.5 w-4.5' />}
      >
        {t('continue')}
      </Button>
    </div>
  );
}
