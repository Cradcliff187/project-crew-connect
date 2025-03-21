
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      <span className="ml-2">Processing document...</span>
    </div>
  );
};

export default LoadingState;
