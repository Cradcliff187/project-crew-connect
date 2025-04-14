import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, CircleDashed, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status?: string;
  label: string;
  color?: string;
  size?: 'sm' | 'default';
  className?: string;
  showIcon?: boolean;
}

/**
 * Universal status badge component aligned with AKC LLC brand guidelines
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  color = 'neutral',
  size = 'default',
  className = '',
  showIcon = true,
}) => {
  // Get status icon
  const getStatusIcon = () => {
    if (!showIcon) return null;

    switch (color) {
      case 'green':
      case 'success':
        return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />;
      case 'blue':
      case 'info':
      case 'primary':
        return <Clock className="mr-1.5 h-3.5 w-3.5" />;
      case 'amber':
      case 'warning':
        return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
      case 'red':
      case 'error':
        return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
      default:
        return <CircleDashed className="mr-1.5 h-3.5 w-3.5" />;
    }
  };

  // Get status class based on status type
  const getStatusClass = () => {
    switch (color) {
      case 'green':
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'blue':
      case 'info':
      case 'primary':
        return 'bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]';
      case 'amber':
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'red':
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'neutral':
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
      <span>{label}</span>
    </Badge>
  );
};

export default StatusBadge;
