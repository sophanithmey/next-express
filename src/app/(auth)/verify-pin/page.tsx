'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/templates/auth-layout';
import { Button } from '@/components/atoms/button';
import { ErrorMessage } from '@/components/molecules/error-message';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function VerifyPinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const redirectUrl = searchParams.get('redirect') || '';
  const { login, isAuthenticated } = useAuthState();

  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newPin = [...pin];
    newPin[index] = val.slice(-1);
    setPin(newPin);

    // Auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }

    // Auto submit if all 4 digits filled
    if (newPin.every((d) => d !== '') && val) {
      handleVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (pinString: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          pin: pinString,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid PIN code. Please try again.');
        setPin(['', '', '', '']);
        document.getElementById('pin-input-0')?.focus();
        return;
      }

      if (data.user) {
        login(data.user);
      }

      const destination = redirectUrl || '/dashboard';
      router.replace(destination);
    } catch {
      setError('Network error validating PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setCountdown(60);
    try {
      await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
    } catch {
      // Ignored
    }
  };

  return (
    <AuthLayout
      title="Enter Verification PIN"
      subtitle={`We sent a 4-digit code to ${phone || 'your phone number'}`}
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} />}

        <div className="flex justify-center gap-3">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              id={`pin-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={idx === 0}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-14 w-12 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          ))}
        </div>

        <p className="text-center text-xs text-slate-400">
          Demo Mode: enter any 4 digits (e.g. <strong>1234</strong>)
        </p>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={pin.some((d) => !d)}
          onClick={() => handleVerify(pin.join(''))}
          leftIcon={<Check className="h-4 w-4" />}
        >
          Verify PIN and Login
        </Button>

        <div className="flex items-center justify-between pt-2 text-xs">
          <Link
            href="/login"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Phone</span>
          </Link>

          {countdown > 0 ? (
            <span className="text-slate-400">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Resend Code</span>
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyPinPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyPinContent />
    </Suspense>
  );
}
