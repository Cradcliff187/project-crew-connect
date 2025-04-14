import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastSuccessProps {
  title: string;
  description?: string;
}

const ToastSuccess: React.FC<ToastSuccessProps> = ({ title, description }) => {
  return (
    <div className="flex items-start space-x-3">
      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default ToastSuccess;
