import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';
import { CheckCircle2, AlertCircle, CircleDashed, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'default';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'default',
  className = '',
}) => {
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'active':
      case 'completed':
      case 'approved':
        return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />;
      case 'warning':
      case 'pending':
      case 'in_progress':
        return <Clock className="mr-1.5 h-3.5 w-3.5" />;
      case 'error':
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
      default:
        return <CircleDashed className="mr-1.5 h-3.5 w-3.5" />;
    }
  };

  // Generate a display label from the status if none provided
  const getDisplayLabel = () => {
    if (label) return label;

    // Convert status to readable format
    let displayLabel = status.toString();

    // Handle special cases
    if (displayLabel.includes('_')) {
      displayLabel = displayLabel.replace(/_/g, ' ');
    }

    // Capitalize first letter of each word
    return displayLabel
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get status class based on status type
  const getStatusClass = () => {
    switch (status) {
      case 'success':
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'info':
      case 'in_progress':
      case 'qualified':
      case 'verified':
        return 'bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]';
      case 'warning':
      case 'pending':
      case 'on_hold':
      case 'on-hold':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
      case 'cancelled':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'neutral':
      case 'inactive':
      case 'draft':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
      {getDisplayLabel()}
    </Badge>
  );
};

export default StatusBadge;
