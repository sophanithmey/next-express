'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import {
  sanitizeCambodiaPhoneInput,
  validatePhoneNumber,
} from '@/lib/phone-number';
import { authApiService } from '../services/auth-api-service';
import { UserProfile } from '../types/auth-types';

export type AuthModalStep = 'phone' | 'pin';

interface UseAuthenticationModalParams {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
}

export function useAuthenticationModal({
  isOpen,
  onSuccess,
}: UseAuthenticationModalParams) {
  const locale = useLocale();
  const [step, setStep] = useState<AuthModalStep>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep('phone');
    setPhone('');
    setPin('');
    setError('');
  }, [isOpen]);

  const requestPinMutation = useMutation({
    mutationFn: (phoneNumber: string) =>
      authApiService.requestPin({ phoneNumber }, locale),
  });

  const verifyPinMutation = useMutation({
    mutationFn: (vars: { phoneNumber: string; pin: string }) =>
      authApiService.verifyPin(vars, locale),
  });

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(sanitizeCambodiaPhoneInput(value));
    setError('');
  }, []);

  const handlePinChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setError('');
  }, []);

  const handleBack = useCallback(() => {
    setStep('phone');
    setPin('');
    setError('');
  }, []);

  const handleRequestPin = useCallback(async () => {
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid Cambodian phone number');
      return;
    }

    setError('');
    try {
      const result = await requestPinMutation.mutateAsync(phone);
      if (!result.success) {
        setError(result.message || 'Unable to process login request');
        return;
      }
      setStep('pin');
      setPin('');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to process login request',
      );
    }
  }, [phone, requestPinMutation]);

  const handleVerifyPin = useCallback(
    async (pinToVerify?: string) => {
      const code = (pinToVerify ?? pin).replace(/\D/g, '').slice(0, 4);
      if (code.length < 4) {
        setError('Please enter your 4-digit PIN');
        return;
      }

      if (verifyPinMutation.isPending) return;
      setError('');
      try {
        const result = await verifyPinMutation.mutateAsync({
          phoneNumber: phone,
          pin: code,
        });
        if (!result.success || !result.user) {
          setError(result.message || 'Incorrect PIN. Please try again.');
          return;
        }
        onSuccess(result.user);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Unable to verify PIN right now.',
        );
      }
    },
    [onSuccess, phone, pin, verifyPinMutation],
  );

  return {
    step,
    phone,
    pin,
    isLoading: requestPinMutation.isPending || verifyPinMutation.isPending,
    error,
    handlePhoneChange,
    handlePinChange,
    handleBack,
    handleRequestPin,
    handleVerifyPin,
  };
}
