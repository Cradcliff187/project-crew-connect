
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  
  // Placeholder authentication check - always returns true for now
  const isAuthenticated = true;

  if (!isAuthenticated && location.pathname !== '/login') {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RouteGuard;
