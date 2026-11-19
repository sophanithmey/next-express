'use client';

import React, { createContext } from 'react';
import dynamic from 'next/dynamic';
import { useAuthProvider } from '../hooks/use-auth-provider';
import { AuthContextValue, UserProfile } from '../types/auth-types';

const AuthenticationModal = dynamic(
  () =>
    import('@/components/organisms/authentication-modal').then(
      (mod) => mod.AuthenticationModal,
    ),
  { ssr: false },
);

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
      {isAuthModalOpen && (
        <AuthenticationModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </AuthContext.Provider>
  );
}
