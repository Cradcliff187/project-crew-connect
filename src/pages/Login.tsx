import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log('Sign-in process initiated...');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/akc-logo.png" alt="AKC LLC Logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Login to AKC LLC</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
