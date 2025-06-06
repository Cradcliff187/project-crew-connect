import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'field_user';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  // Enhanced role-based properties
  role: UserRole | null;
  employeeId: string | null;
  isAdmin: boolean;
  isFieldUser: boolean;
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Role management
  refreshUserRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Debug flag - set to false in production
const DEBUG_AUTH = process.env.NODE_ENV === 'development';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced role-based state
  const [role, setRole] = useState<UserRole | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isRoleFetching, setIsRoleFetching] = useState(false);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);

  const navigate = useNavigate();

  // Computed role properties
  const isAdmin = role === 'admin';
  const isFieldUser = role === 'field_user';

  // Debounce role fetching to prevent multiple concurrent calls
  const fetchUserRole = async (userId: string) => {
    // Skip if already fetching for the same user
    if (isRoleFetching || lastFetchedUserId === userId) {
      return;
    }

    try {
      setIsRoleFetching(true);
      setLastFetchedUserId(userId);

      // Try to get role from JWT token first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.role && user?.user_metadata?.employee_id) {
        setRole(user.user_metadata.role as UserRole);
        setEmployeeId(user.user_metadata.employee_id);
        return;
      }

      // Simple database fallback
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id, app_role')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setRole(data.app_role as UserRole);
        setEmployeeId(data.employee_id);
      } else {
        console.warn('[AuthContext] No role data found for user:', userId);
        setRole(null);
        setEmployeeId(null);
      }
    } catch (error) {
      console.error('[AuthContext] Role fetch error:', error);
      setRole(null);
      setEmployeeId(null);
    } finally {
      setIsRoleFetching(false);
    }
  };

  // Function to refresh user role (useful after role changes)
  const refreshUserRole = async () => {
    if (session?.user?.id) {
      await fetchUserRole(session.user.id);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Try to fetch role data but don't let it block loading
        if (initialSession?.user?.id) {
          fetchUserRole(initialSession.user.id).catch(error => {
            console.error('[AuthContext] Initial role fetch failed:', error);
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        // Always complete loading regardless of role fetch status
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        // Prevent duplicate processing of the same event
        const eventKey = `${_event}-${currentSession?.user?.id || 'none'}`;
        if (lastAuthEvent === eventKey && _event !== 'TOKEN_REFRESHED') {
          return;
        }
        setLastAuthEvent(eventKey);

        if (DEBUG_AUTH) {
          console.log('[AuthContext] Auth event:', _event, currentSession?.user?.email);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Handle role data - don't block on this
        if (currentSession?.user?.id) {
          const needsRoleFetch =
            !role || !employeeId || lastFetchedUserId !== currentSession.user.id;

          if (needsRoleFetch) {
            fetchUserRole(currentSession.user.id).catch(error => {
              console.error('[AuthContext] Role fetch failed for event:', _event, error);
            });
          }
        } else {
          setRole(null);
          setEmployeeId(null);
          setLastFetchedUserId(null);
        }

        // Always complete loading
        setIsLoading(false);

        // Simple navigation handling
        if (_event === 'SIGNED_OUT') {
          setRole(null);
          setEmployeeId(null);
          setLastFetchedUserId(null);
          setIsRoleFetching(false);
          navigate('/login');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Use the correct production URL explicitly
      const redirectUrl =
        window.location.hostname === 'localhost'
          ? `${window.location.origin}/auth/callback`
          : 'https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear role data immediately
      setRole(null);
      setEmployeeId(null);
      setLastFetchedUserId(null);
      setIsRoleFetching(false);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    role,
    employeeId,
    isAdmin,
    isFieldUser,
    signInWithGoogle,
    signOut,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
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
