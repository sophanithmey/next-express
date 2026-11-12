'use client';

import React, { createContext } from 'react';
import { AuthenticationModal } from '@/components/organisms/authentication-modal';
import { useAuthProvider } from '../hooks/use-auth-provider';
import { AuthContextValue, UserProfile } from '../types/auth-types';

export type { AuthContextValue };

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const {
    contextValue,
    isAuthModalOpen,
    closeAuthModal,
    handleModalSuccess,
  } = useAuthProvider(initialUser);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleModalSuccess}
      />
    </AuthContext.Provider>
  );
}
