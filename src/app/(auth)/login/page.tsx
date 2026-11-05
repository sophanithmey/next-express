'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/templates/auth-layout';
import { PhoneInput } from '@/components/molecules/phone-input';
import { Button } from '@/components/atoms/button';
import { FormField } from '@/components/molecules/form-field';
import { ErrorMessage } from '@/components/molecules/error-message';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const { isAuthenticated, isLoading: authLoading } = useAuthState();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect straight to target or dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectUrl || '/dashboard');
    }
  }, [isAuthenticated, authLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = phoneNumber.trim();
    if (clean.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: clean }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send PIN. Please try again.');
        return;
      }

      const queryParams = new URLSearchParams({ phone: clean });
      if (redirectUrl) {
        queryParams.set('redirect', redirectUrl);
      }

      router.push(`/verify-pin?${queryParams.toString()}`);
    } catch {
      setError('Network error connecting to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthLayout title="Merchant Sign In" subtitle="Checking session…">
        <div className="py-8 text-center text-xs text-slate-400">Loading sign in…</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Merchant Sign In"
      subtitle={
        redirectUrl
          ? 'Sign in to access your dispatch operations and history'
          : 'Enter your mobile phone number to receive a secure login PIN'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {redirectUrl && (
          <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-2.5 text-xs text-brand-800 font-medium">
            <Truck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Sign in required to access this page</span>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <FormField
          label="Mobile Phone Number"
          required
          hint="We will send a 4-digit verification code via SMS"
        >
          <PhoneInput
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="12 888 999"
            required
            autoFocus
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue with SMS PIN
        </Button>

        <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Protected by Wing Bank Consumer Identity Service</span>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
