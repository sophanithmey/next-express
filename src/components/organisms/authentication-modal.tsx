'use client';

import React from 'react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { useAuthenticationModal } from '@/features/auth/hooks/use-authentication-modal';
import { AuthPhoneStep } from '../molecules/auth-phone-step';
import { AuthPinStep } from '../molecules/auth-pin-step';
import { AuthModalHeader } from '../molecules/auth-modal-header';

export interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export function AuthenticationModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthenticationModalProps) {
  const {
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
  } = useAuthenticationModal({ isOpen, onSuccess });

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-60 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      {/* Consistent Backdrop Overlay */}
      <div
        className='absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200'
        aria-hidden='true'
      />

      {/* Consistent Modal Container */}
      <div className='relative z-10 w-full max-w-xl flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150'>
        <AuthModalHeader onClose={onClose} />

        {/* Modal Dynamic Body */}
        <div className='px-6 py-5 sm:px-8 sm:py-6'>
          {step === 'phone' ? (
            <AuthPhoneStep
              phone={phone}
              onChangePhone={handlePhoneChange}
              onSubmit={handleRequestPin}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <AuthPinStep
              phone={phone}
              pin={pin}
              onChangePin={handlePinChange}
              onVerify={handleVerifyPin}
              onBack={handleBack}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
