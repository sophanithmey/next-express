'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type ModalStep = 'phone' | 'pin';

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<ModalStep>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const phoneRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setPin('');
      setError('');
      setTimeout(() => phoneRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => pinRef.current?.focus(), 120);
    }
  }, [step]);

  // Auto-verify when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && step === 'pin' && !isLoading) {
      handleVerifyPin(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  if (!isOpen) return null;

  const handleRequestPin = async () => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send PIN. Please try again.');
        return;
      }

      setStep('pin');
    } catch {
      setError('Unable to reach authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async (pinToVerify = pin) => {
    if (pinToVerify.length !== 4) {
      setError('Please enter your 4-digit PIN.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          pin: pinToVerify,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(
          data.message || 'Invalid PIN code. Please verify and try again.',
        );
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('Authentication failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='login-modal-title'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal Card */}
      <div className='relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50'>
          <div>
            <h2
              id='login-modal-title'
              className='text-base font-bold text-slate-900'
            >
              {step === 'phone' ? 'Seller Sign In' : 'Verify Your PIN'}
            </h2>
            <p className='mt-0.5 text-xs text-slate-500'>
              {step === 'phone'
                ? 'Enter your mobile phone number to confirm booking'
                : `4-digit code sent to ${phone}`}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className='p-5 space-y-4'>
          {step === 'phone' ? (
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='modal-phone'>Seller Phone Number</Label>
                <Input
                  id='modal-phone'
                  ref={phoneRef}
                  type='tel'
                  placeholder='e.g. 012 888 999'
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestPin()}
                  leftIcon={<Phone className='h-4 w-4' />}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className='text-xs font-medium text-rose-600'>{error}</p>
              )}

              <Button
                type='button'
                variant='primary'
                size='md'
                className='w-full'
                onClick={handleRequestPin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Sending PIN…
                  </span>
                ) : (
                  'Continue with SMS PIN'
                )}
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='modal-pin'>4-Digit Verification PIN</Label>
                <Input
                  id='modal-pin'
                  ref={pinRef}
                  type='password'
                  inputMode='numeric'
                  maxLength={4}
                  placeholder='••••'
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin(pin)}
                  leftIcon={<Lock className='h-4 w-4' />}
                  className='tracking-widest text-center text-lg font-bold'
                  disabled={isLoading}
                />
                <p className='text-[11px] text-slate-500'>
                  Demo Mode: enter any 4 digits (e.g. <strong>1234</strong>)
                </p>
              </div>

              {error && (
                <p className='text-xs font-medium text-rose-600'>{error}</p>
              )}

              <Button
                type='button'
                variant='primary'
                size='md'
                className='w-full'
                onClick={() => handleVerifyPin(pin)}
                disabled={isLoading || pin.length < 4}
              >
                {isLoading ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Verifying…
                  </span>
                ) : (
                  'Verify & Continue Booking'
                )}
              </Button>

              <button
                type='button'
                onClick={() => {
                  setStep('phone');
                  setPin('');
                  setError('');
                }}
                className='w-full text-center text-xs text-slate-500 hover:text-brand-600 transition font-medium'
              >
                Change phone number
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className='border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500'>
          <ShieldCheck className='h-3.5 w-3.5 text-emerald-600 flex-shrink-0' />
          <span>Your booking details are preserved &amp; dispatch ready</span>
        </div>
      </div>
    </div>
  );
}
