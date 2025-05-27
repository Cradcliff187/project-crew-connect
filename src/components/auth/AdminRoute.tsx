import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  fallbackPath = '/active-work',
}) => {
  const { isAdmin, isLoading, session } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to fallback path if not admin
  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminRoute;
