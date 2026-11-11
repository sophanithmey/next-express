'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { UserProfile } from '../types/auth-types';
import { AuthenticationModal } from '@/components/organisms/authentication-modal';

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (callback?: (user: UserProfile) => void) => void;
  closeAuthModal: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState<((u: UserProfile) => void) | null>(null);
  const router = useRouter();

  // If initialUser was not passed on SSR, check session cookie via API route
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.isAuthenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch {
      // Best effort fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsLoading(false);
    } else {
      refreshSession();
    }
  }, [initialUser, refreshSession]);

  const login = useCallback(
    (profile: UserProfile) => {
      setUser(profile);
      setIsLoading(false);
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    setUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

  const openAuthModal = useCallback((callback?: (u: UserProfile) => void) => {
    setAuthCallback(() => (callback ? callback : null));
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthCallback(null);
  }, []);

  const handleModalSuccess = useCallback(
    (verifiedUser: UserProfile) => {
      login(verifiedUser);
      setIsAuthModalOpen(false);
      if (authCallback) {
        authCallback(verifiedUser);
        setAuthCallback(null);
      }
    },
    [authCallback, login],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        isLoading,
        login,
        logout,
        refreshSession,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleModalSuccess}
      />
    </AuthContext.Provider>
  );
}
