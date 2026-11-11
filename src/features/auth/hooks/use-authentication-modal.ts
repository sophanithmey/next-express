'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/auth-types';
import {
  isValidCambodiaPhoneNumber,
  normalizePhoneNumber,
} from '@/lib/phone-number';

export type AuthModalStep = 'phone' | 'pin';

interface UseAuthenticationModalParams {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
}

/**
 * Manages two-step phone + PIN authentication state, validation, and API calls
 * for `AuthenticationModal`.
 */
export function useAuthenticationModal({
  isOpen,
  onSuccess,
}: UseAuthenticationModalParams) {
  const [step, setStep] = useState<AuthModalStep>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setPin('');
      setError('');
    }
  }, [isOpen]);

  const handlePhoneChange = useCallback((val: string) => {
    setPhone(val);
    setError('');
  }, []);

  const handlePinChange = useCallback((val: string) => {
    setPin(val);
    setError('');
  }, []);

  const handleBack = useCallback(() => {
    setStep('phone');
    setPin('');
    setError('');
  }, []);

  const handleRequestPin = useCallback(async () => {
    if (isLoading) return;
    if (!isValidCambodiaPhoneNumber(phone)) {
      setError(
        'Please enter a valid Cambodian phone number (e.g. 012 888 999).',
      );
      return;
    }

    const normalized = normalizePhoneNumber(phone);
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send PIN. Please try again.');
        return;
      }
      setStep('pin');
    } catch {
      setError('Unable to reach authentication service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, phone]);

  const handleVerifyPin = useCallback(
    async (enteredPin = pin) => {
      if (isLoading) return;
      if (enteredPin.length !== 4) {
        setError('Please enter your 4-digit PIN.');
        return;
      }

      const normalized = normalizePhoneNumber(phone);
      setIsLoading(true);
      setError('');

      try {
        const res = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: normalized, pin: enteredPin }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setPin('');
          setError(data.message || 'Incorrect PIN code. Please try again.');
          return;
        }

        const verifiedUser: UserProfile = data.user || {
          id: `seller-${phone.replace(/[^\d]/g, '')}`,
          phoneNumber: phone,
          name: 'Express Merchant Store',
          shopName: 'Central Express Boutique',
          role: 'SELLER',
        };
        onSuccess(verifiedUser);
      } catch {
        setError('Verification service unavailable. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, onSuccess, phone, pin],
  );

  return {
    step,
    phone,
    pin,
    isLoading,
    error,
    handlePhoneChange,
    handlePinChange,
    handleBack,
    handleRequestPin,
    handleVerifyPin,
  };
}

