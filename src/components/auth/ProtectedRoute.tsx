
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticationForm } from './AuthenticationForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-2xl font-bold mt-4">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we check your authentication</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthenticationForm />;
  }

  return <>{children}</>;
}
