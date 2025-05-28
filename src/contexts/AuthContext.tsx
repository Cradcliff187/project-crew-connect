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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced role-based state
  const [role, setRole] = useState<UserRole | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Computed role properties
  const isAdmin = role === 'admin';
  const isFieldUser = role === 'field_user';

  // Function to fetch user role and employee data
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching user role for:', userId);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 30000); // 30 second timeout
      });

      const queryPromise = supabase
        .from('employees')
        .select('employee_id, app_role')
        .eq('user_id', userId)
        .single();

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (error) {
        console.error('[AuthContext] Error fetching user role:', error);

        // Check if it's a timeout or other error
        if (error.message === 'Query timeout') {
          console.error('[AuthContext] Query timed out - possible RLS or network issue');
        } else if (error.code === 'PGRST116') {
          console.warn('[AuthContext] No employee record found for user:', userId);
        } else {
          console.error('[AuthContext] Database error:', error.code, error.message);
        }

        // Set role to null but don't throw - let the user continue
        setRole(null);
        setEmployeeId(null);
        return;
      }

      if (data) {
        console.log('[AuthContext] User role data:', data);
        setRole(data.app_role as UserRole);
        setEmployeeId(data.employee_id);
        console.log('[AuthContext] Role set to:', data.app_role, 'Employee ID:', data.employee_id);
      } else {
        console.warn('[AuthContext] No employee data found for user:', userId);
        setRole(null);
        setEmployeeId(null);
      }
    } catch (error) {
      console.error('[AuthContext] Exception fetching user role:', error);
      setRole(null);
      setEmployeeId(null);
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
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        console.log('[AuthContext] Initial session:', initialSession?.user?.email || 'No session');
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Fetch role data if user is authenticated
        if (initialSession?.user?.id) {
          fetchUserRole(initialSession.user.id).finally(() => {
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(
          `[AuthContext] onAuthStateChange event: ${_event}`,
          currentSession?.user?.email || 'No session'
        );
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Handle role data based on auth state
        if (currentSession?.user?.id) {
          await fetchUserRole(currentSession.user.id);
        } else {
          // Clear role data when user signs out
          setRole(null);
          setEmployeeId(null);
        }

        setIsLoading(false);

        if (_event === 'SIGNED_OUT') {
          // Clear all role data
          setRole(null);
          setEmployeeId(null);
          navigate('/login');
        } else if (_event === 'PASSWORD_RECOVERY') {
          // Handle password recovery if needed, e.g., redirect to a reset password page
          // navigate('/reset-password');
        } else if ((_event as string) === 'USER_DELETED') {
          // Cast to string to handle potential type mismatch
          setRole(null);
          setEmployeeId(null);
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
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
