'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/templates/auth-layout';
import { PhoneInput } from '@/components/molecules/phone-input';
import { Button } from '@/components/atoms/button';
import { FormField } from '@/components/molecules/form-field';
import { ErrorMessage } from '@/components/molecules/error-message';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      router.push(`/verify-pin?phone=${encodeURIComponent(clean)}`);
    } catch {
      setError('Network error connecting to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Merchant Sign In"
      subtitle="Enter your mobile phone number to receive a secure login PIN"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
