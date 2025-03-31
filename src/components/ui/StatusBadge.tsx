
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  size?: 'sm' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'default' }) => {
  const getStatusClass = () => {
    const lowerStatus = status.toLowerCase();
    
    switch (lowerStatus) {
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'sent':
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'converted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
      case 'on-hold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string): string => {
    // Replace underscores with spaces and capitalize each word
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const sizeClass = size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <Badge
      variant="outline"
      className={`${getStatusClass()} font-medium border ${sizeClass} ${className}`}
    >
      {formatStatus(status)}
    </Badge>
  );
};

export default StatusBadge;
