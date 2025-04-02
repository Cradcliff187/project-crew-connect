
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status?: string;
  label: string;
  color?: string;
  size?: 'sm' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status,
  label, 
  color = 'neutral', 
  size = 'default',
  className = '' 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blue':
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'amber':
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'red':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <Badge
      variant="outline"
      className={`${getColorClasses()} font-medium border ${sizeClasses} ${className}`}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
