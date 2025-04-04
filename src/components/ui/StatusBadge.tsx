
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';
import { CheckCircle2, AlertCircle, CircleDashed, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'default';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  size = 'default',
  className = '' 
}) => {
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />;
      case 'warning':
      case 'pending':
        return <Clock className="mr-1.5 h-3.5 w-3.5" />;
      case 'error':
        return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
      default:
        return <CircleDashed className="mr-1.5 h-3.5 w-3.5" />;
    }
  };
  
  // Get status class based on status type
  const getStatusClass = () => {
    switch (status) {
      case 'success':
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'info':
        return 'bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]';
      case 'warning':
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'neutral':
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  
  return (
    <Badge 
      variant="outline" 
      className={`font-medium flex items-center ${getStatusClass()} ${sizeClasses} ${className}`}
    >
      {getStatusIcon()}
      {label}
    </Badge>
  );
};

export default StatusBadge;
