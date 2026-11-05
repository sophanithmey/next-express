'use client';

import { useContext } from 'react';
import { AuthContext } from '../components/auth-provider';

export function useAuthState() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthState must be used within <AuthProvider>');
  }
  return ctx;
}
