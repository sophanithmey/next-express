'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/routing';
import { authApiService, SessionStateResponse } from '../services/auth-api-service';
import { AuthContextValue, UserProfile } from '../types/auth-types';
import { authKeys } from './auth-keys';

import { HAS_SESSION_COOKIE_NAME } from '@/lib/constants';

function hasClientSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${HAS_SESSION_COOKIE_NAME}=1`);
}

/**
 * Manages authentication session queries, login/logout state, and auth modal callbacks.
 */
export function useAuthProvider(initialUser: UserProfile | null = null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState<
    ((user: UserProfile) => void) | null
  >(null);

  const sessionQuery = useQuery<SessionStateResponse>({
    queryKey: authKeys.session(),
    queryFn: () => authApiService.getSession(),
    initialData: initialUser
      ? {
          isAuthenticated: true,
          user: initialUser,
        }
      : undefined,
    staleTime: 60_000,
  });

  const user = sessionQuery.data?.user ?? initialUser ?? null;

  const login = useCallback(
    (newUser: UserProfile) => {
      if (typeof document !== 'undefined') {
        document.cookie = `${HAS_SESSION_COOKIE_NAME}=1; path=/; max-age=604800; SameSite=Lax`;
      }
      queryClient.setQueryData<SessionStateResponse>(authKeys.session(), {
        isAuthenticated: true,
        user: newUser,
      });
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
    },
    [queryClient],
  );

  const logoutMutation = useMutation({
    mutationFn: () => authApiService.logout(),
    onSettled: () => {
      if (typeof document !== 'undefined') {
        document.cookie = `${HAS_SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      queryClient.setQueryData<SessionStateResponse>(authKeys.session(), {
        isAuthenticated: false,
        user: null,
      });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
      setAuthCallback(null);
      setIsAuthModalOpen(false);
      router.push('/');
      router.refresh();
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Session cleanup and navigation handled in onSettled
    }
  }, [logoutMutation]);

  const refreshSession = useCallback(async () => {
    await sessionQuery.refetch();
  }, [sessionQuery]);

  const openAuthModal = useCallback((callback?: (user: UserProfile) => void) => {
    if (callback) {
      setAuthCallback(() => callback);
    }
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

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      isLoading: sessionQuery.isFetching || logoutMutation.isPending,
      login,
      logout,
      refreshSession,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [
      closeAuthModal,
      isAuthModalOpen,
      login,
      logout,
      logoutMutation.isPending,
      openAuthModal,
      refreshSession,
      sessionQuery.isFetching,
      user,
    ],
  );

  return {
    contextValue,
    isAuthModalOpen,
    closeAuthModal,
    handleModalSuccess,
  };
}

