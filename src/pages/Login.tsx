import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Placeholder login functionality
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/akc-logo.png" alt="AKC LLC Logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#0485ea] mb-6">Login to AKC LLC</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Button onClick={handleLogin} className="w-full bg-[#0485ea] hover:bg-[#0373ce]">
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
