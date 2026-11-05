'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../types/auth-types';

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
