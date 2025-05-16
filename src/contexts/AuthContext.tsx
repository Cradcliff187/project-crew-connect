import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Add other auth methods as needed (e.g., signInWithPassword)
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`[AuthContext] onAuthStateChange event: ${_event}`, currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (_event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (_event === 'PASSWORD_RECOVERY') {
          // Handle password recovery if needed, e.g., redirect to a reset password page
          // navigate('/reset-password');
        } else if ((_event as string) === 'USER_DELETED') {
          // Cast to string to handle potential type mismatch
          navigate('/login');
        } else if (_event === 'INITIAL_SESSION' && !currentSession) {
          // This can happen if the stored session is invalid or expired on load
          // No need to navigate to /login here as useRequireAuth will handle it
          // if the current page requires auth.
          console.log('[AuthContext] Initial session was null or invalid.');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Ensure the redirectTo is an absolute URL for your auth callback page
          redirectTo: new URL('/auth/callback', window.location.origin).toString(),
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Handle error (e.g., show toast)
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // The onAuthStateChange listener will handle navigation to /login
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle error
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook to ensure session is available before performing actions
export const useRequireAuth = (options?: { redirectTo?: string }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { redirectTo = '/login' } = options || {};

  useEffect(() => {
    if (!auth.isLoading && !auth.session) {
      console.log('[useRequireAuth] No session, redirecting to login.');
      navigate(redirectTo, { replace: true, state: { from: window.location.pathname } });
    }
  }, [auth.isLoading, auth.session, navigate, redirectTo]);

  return auth;
};

// Ensure session function to be called before DB operations
export const ensureSession = async (): Promise<Session | null> => {
  // First, try to get the current session from the client state
  // This might be fresh if onAuthStateChange has recently run
  const session = supabase.auth.getSession ? (await supabase.auth.getSession()).data.session : null;

  if (session) {
    return session;
  }

  // If no session, try to refresh. This is important for the first load or if the session has expired.
  console.warn('ensureSession: No active session found locally, attempting refresh.');
  try {
    const {
      data: { session: refreshedSession },
      error: refreshError,
    } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('Error refreshing session in ensureSession:', refreshError);
      // If refresh fails (e.g. refresh token expired or network issue), navigate to login
      // This is an important part of the recovery flow.
      // Note: This navigation should ideally be handled in a way that doesn't make `ensureSession` side-effectful
      // For now, logging and returning null. The calling code or useRequireAuth should handle redirection.
      // window.location.href = '/login'; // Avoid direct navigation from here if possible.
      return null;
    }
    if (!refreshedSession) {
      console.warn('ensureSession: Still no session after refresh attempt.');
      return null;
    }
    console.log('ensureSession: Session refreshed successfully.');
    // Manually update the client's current session if possible, though onAuthStateChange should also pick this up.
    // await supabase.auth.setSession(refreshedSession); // Be cautious with setSession, usually managed internally
    return refreshedSession;
  } catch (e) {
    console.error('Exception during refreshSession in ensureSession:', e);
    return null;
  }
};
