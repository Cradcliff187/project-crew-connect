import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface RouteGuardProps {
  children: ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { session, isLoading } = useAuth(); // Use the AuthContext
  const location = useLocation();

  // console.log(
  //   '[RouteGuard] Checking route:',
  //   location.pathname,
  //   'isLoading:',
  //   isLoading,
  //   'session exists:',
  //   !!session
  // );

  if (isLoading) {
    // console.log('[RouteGuard] isLoading is true, rendering loading screen...');
    return <div>Loading session...</div>; // Or your app's loading component
  }

  // If not loading and no session, and not already on the login page, redirect to login
  if (!session && location.pathname !== '/login') {
    // console.log(
    //   '[RouteGuard] No session and not on /login. Redirecting to /login. Current path:',
    //   location.pathname
    // );
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // console.log('[RouteGuard] Access granted. Current path:', location.pathname);
  // If there is a session, or if on the login page (even without a session), render children
  return <>{children}</>;
};

export default RouteGuard;
