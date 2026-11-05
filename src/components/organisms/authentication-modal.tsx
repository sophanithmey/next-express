'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, Lock, Loader2, ShieldCheck, Check } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type Step = 'phone' | 'pin';

export function AuthenticationModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthenticationModalProps) {
  const [step, setStep] = useState<Step>('phone');
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

  // Auto-verify on 4-digit PIN
  useEffect(() => {
    if (pin.length === 4 && step === 'pin' && !isLoading) {
      handleVerify(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  if (!isOpen) return null;

  const handleSendPin = async () => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }
    setIsLoading(true);
    setError('');

    // Simulate fast mock authentication delay
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setStep('pin');
  };

  const handleVerify = async (enteredPin = pin) => {
    if (enteredPin.length !== 4) {
      setError('Please enter your 4-digit PIN.');
      return;
    }
    setIsLoading(true);
    setError('');

    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    const mockUser: UserProfile = {
      id: `seller-${phone.replace(/[^\d]/g, '') || 'demo'}`,
      phoneNumber: phone || '012 888 999',
      name: 'Express Merchant Store',
      shopName: 'Central Express Boutique',
      role: 'SELLER',
    };

    onSuccess(mockUser);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {step === 'phone' ? 'Seller Verification' : 'Enter 4-Digit PIN'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {step === 'phone'
                ? 'Sign in to confirm and dispatch your booking'
                : `Verification code sent to ${phone}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="auth-phone">Mobile Phone Number</Label>
                <Input
                  id="auth-phone"
                  ref={phoneRef}
                  type="tel"
                  placeholder="012 888 999"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPin()}
                  leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSendPin}
                isLoading={isLoading}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="auth-pin">4-Digit Verification PIN</Label>
                <Input
                  id="auth-pin"
                  ref={pinRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify(pin)}
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  className="tracking-widest text-center text-lg font-bold"
                  disabled={isLoading}
                />
                <p className="text-[11px] text-slate-500 text-center">
                  Demo PIN: enter any 4 digits (e.g. <strong>1234</strong>)
                </p>
              </div>

              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleVerify(pin)}
                isLoading={isLoading}
                disabled={pin.length < 4}
                leftIcon={<Check className="h-4 w-4" />}
              >
                Verify &amp; Confirm Booking
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setPin('');
                  setError('');
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-brand-600 font-medium"
              >
                Use another phone number
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Form data preserved • Instant dispatch upon verification</span>
        </div>
      </div>
    </div>
  );
}
