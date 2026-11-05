'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, Lock, Loader2 } from 'lucide-react';
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

function generateMockUser(phone: string): UserProfile {
  return {
    id: `user-${Date.now()}`,
    phoneNumber: phone,
    name: 'Seller Account',
    shopName: 'My Online Shop',
  };
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<ModalStep>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const phoneRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setPin('');
      setError('');
      setTimeout(() => phoneRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-focus pin input on step change
  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => pinRef.current?.focus(), 100);
    }
  }, [step]);

  // Auto-submit when 4 PIN digits entered
  useEffect(() => {
    if (pin.length === 4 && step === 'pin') {
      handleVerifyPin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  if (!isOpen) return null;

  const handleRequestPin = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      setError('Please enter a valid phone number.');
      return;
    }
    setIsLoading(true);
    setError('');
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setStep('pin');
  };

  const handleVerifyPin = async () => {
    if (pin.length < 4) {
      setError('Please enter your 4-digit PIN.');
      return;
    }
    setIsLoading(true);
    setError('');
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    // For this demo, any PIN is accepted
    const user = generateMockUser(phone);
    onSuccess(user);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 id="login-modal-title" className="text-base font-bold text-slate-900">
              {step === 'phone' ? 'Sign In to Continue' : 'Enter Your PIN'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {step === 'phone'
                ? 'Enter your seller phone number to receive a PIN'
                : `PIN sent to ${phone}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-phone">Phone Number</Label>
                <Input
                  id="modal-phone"
                  ref={phoneRef}
                  type="tel"
                  placeholder="e.g. 010 123 456"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestPin()}
                  leftIcon={<Phone className="h-4 w-4" />}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleRequestPin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending PIN…
                  </span>
                ) : (
                  'Send PIN'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-pin">4-Digit PIN</Label>
                <Input
                  id="modal-pin"
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
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                  leftIcon={<Lock className="h-4 w-4" />}
                  className="tracking-widest text-center text-lg"
                  disabled={isLoading}
                />
                <p className="text-[11px] text-slate-400">Enter any 4 digits for this demo</p>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleVerifyPin}
                disabled={isLoading || pin.length < 4}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </span>
                ) : (
                  'Confirm & Book'
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setPin(''); setError(''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-brand-600 transition"
              >
                Use a different number
              </button>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-center text-[11px] text-slate-400">
            Your booking details are saved and will be submitted after sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
