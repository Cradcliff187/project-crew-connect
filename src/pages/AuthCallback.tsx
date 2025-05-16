import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (session) {
        // Session is now available, redirect to dashboard or intended page
        // Check for a 'from' location passed in state during a redirect by RouteGuard
        const locationState = (window.history.state as { usr?: { from?: Location } })?.usr;
        const from = locationState?.from?.pathname || '/dashboard';
        console.log('[AuthCallback] Session found, navigating to:', from);
        navigate(from, { replace: true });
      } else {
        // No session, and not loading, something might be wrong or user denied OAuth
        console.log('[AuthCallback] No session after OAuth callback, navigating to login.');
        navigate('/login', { replace: true });
      }
    }
  }, [session, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Loading session... Please wait.</div>
    </div>
  );
};

export default AuthCallback;
