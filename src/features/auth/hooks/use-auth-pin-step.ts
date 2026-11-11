'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import type React from 'react';

interface UseAuthPinStepProps {
  phone: string;
  pin: string;
  isLoading: boolean;
  onChangePin: (val: string) => void;
  onVerify: (pin: string) => void;
}

/**
 * Manages PIN input focus, phone masking, and numeric verification/auto-submit handlers.
 */
export function useAuthPinStep({
  phone,
  pin,
  isLoading,
  onChangePin,
  onVerify,
}: UseAuthPinStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && pin === '') {
      inputRef.current?.focus();
    }
  }, [isLoading, pin]);

  const maskedPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8
      ? `${digits.slice(0, 3)} ••• ${digits.slice(-3)}`
      : phone;
  }, [phone]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
      onChangePin(clean);
      if (clean.length === 4) {
        onVerify(clean);
      }
    },
    [onChangePin, onVerify]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && pin.length === 4 && !isLoading) {
        onVerify(pin);
      }
    },
    [pin, isLoading, onVerify]
  );

  return {
    inputRef,
    maskedPhone,
    focusInput,
    handleInputChange,
    handleKeyDown,
  };
}
