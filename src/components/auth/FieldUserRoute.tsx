import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldUserRouteProps {
  children: React.ReactNode;
}

const FieldUserRoute: React.FC<FieldUserRouteProps> = ({ children }) => {
  const { isAdmin, isFieldUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isFieldUser) {
    // If user is an admin, redirect to their dashboard
    if (isAdmin) {
      return <Navigate to="/admin/time-entries" replace />;
    }

    // If user has no role, show access denied
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              This page is only accessible to field users.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default FieldUserRoute;
