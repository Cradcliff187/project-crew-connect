import { cn } from "@/lib/utils";
import { StatusType } from '@/types/common';
import React from 'react';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  // Safely handle any type of status input
  const safeStatus = typeof status === 'string' ? status : 'unknown';
  const statusLower = safeStatus.toLowerCase();
  
  const getStatusColor = () => {
    switch (statusLower) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      case 'qualified':
        return 'bg-indigo-100 text-indigo-800';
      case 'potential':
        return 'bg-purple-100 text-purple-800';
      case 'prospect':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-teal-100 text-teal-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'unknown':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = () => {
    // Handle special cases
    if (statusLower === 'on_hold' || statusLower === 'on-hold') {
      return 'On Hold';
    }
    
    // Display original status with first letter capitalized
    if (safeStatus === 'unknown') return 'Unknown';
    
    // Convert snake_case to space-separated words with capitalized first letters
    if (safeStatus.includes('_')) {
      return safeStatus
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Otherwise just capitalize first letter
    return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
        size === 'sm' ? 'text-xs' : 'text-sm',
        getStatusColor(),
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
