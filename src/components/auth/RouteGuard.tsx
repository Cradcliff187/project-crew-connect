import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface RouteGuardProps {
  children: ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { session, isLoading } = useAuth(); // Use the AuthContext
  const location = useLocation();

  if (isLoading) {
    return <div>Loading session...</div>; // Or your app's loading component
  }

  // If not loading and no session, and not already on the login page, redirect to login
  if (!session && location.pathname !== '/login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If there is a session, or if on the login page (even without a session), render children
  return <>{children}</>;
};

export default RouteGuard;
