import type { AuthError, Session, User } from '@supabase/supabase-js';
import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

import { AuthContext, type AuthActionResult, type AuthContextValue } from './AuthContext';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

function toAuthError(error: unknown): AuthError {
  if (error instanceof SupabaseAuthError) {
    return error;
  }

  return new SupabaseAuthError('Authentication request failed.');
}

function authRedirectUrl(route: string): string {
  return `${window.location.origin}${route}`;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const setSessionState = (session: Session | null): void => {
      if (!mounted) {
        return;
      }

      setState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    };

    async function loadInitialSession(): Promise<void> {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logger.warn('auth_get_session_failed', {
          code: error.code,
          status: error.status,
        });
      }

      setSessionState(data.session);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session);
    });

    void loadInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          logger.warn('auth_sign_in_failed', {
            code: error.code,
            status: error.status,
          });
        } else {
          logger.info('auth_sign_in_succeeded');
        }

        return { error };
      } catch (error) {
        logger.warn('auth_sign_in_threw');
        return { error: toAuthError(error) };
      }
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string): Promise<AuthActionResult> => {
      try {
        const trimmedDisplayName = displayName?.trim();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: trimmedDisplayName ? { full_name: trimmedDisplayName } : {},
            emailRedirectTo: authRedirectUrl(ROUTES.AUTH_CONFIRM),
          },
        });

        if (error) {
          logger.warn('auth_sign_up_failed', {
            code: error.code,
            status: error.status,
          });
        } else {
          logger.info('auth_sign_up_succeeded');
        }

        return { error };
      } catch (error) {
        logger.warn('auth_sign_up_threw');
        return { error: toAuthError(error) };
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authRedirectUrl(ROUTES.AUTH_CALLBACK),
        },
      });

      if (error) {
        logger.warn('auth_google_sign_in_failed', {
          code: error.code,
          status: error.status,
        });
      } else {
        logger.info('auth_google_redirect_started');
      }

      return { error };
    } catch (error) {
      logger.warn('auth_google_sign_in_threw');
      return { error: toAuthError(error) };
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.warn('auth_sign_out_failed', {
        code: error.code,
        status: error.status,
      });
      return;
    }

    logger.info('auth_sign_out_succeeded');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      user: state.user,
      loading: state.loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [
      state.loading,
      state.session,
      state.user,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
