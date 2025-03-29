
import React from 'react';
import { Badge } from './badge';
import { StatusType } from '@/types/common';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'default';
  showText?: boolean;
}

const StatusBadge = ({ 
  status, 
  className = '',
  size = 'default',
  showText = true
}: StatusBadgeProps) => {
  // Normalize the status by removing underscores and converting to lowercase
  const normalizedStatus = status.replace('_', '').toLowerCase();
  
  // Get appropriate style based on the status
  const getStatusStyle = () => {
    // General project/work order statuses
    switch (normalizedStatus) {
      case 'active':
      case 'inprogress':
      case 'ontrack':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      
      case 'onhold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      
      case 'pending':
      case 'new':
      case 'notstarted':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      // Contact statuses
      case 'prospect':
      case 'potential':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        
      case 'qualified':
      case 'verified':
      case 'approved':
        return 'bg-teal-100 text-teal-800 border-teal-200';
        
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';

      // Change order statuses
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      
      case 'submitted':
        return 'bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/30';
      
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      
      case 'implemented':
        return 'bg-[#0485ea]/20 text-[#0485ea] border-[#0485ea]/30';
      
      // Warning states
      case 'warning':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      
      // UI status types for consistent styling
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get the display text for the status
  const getStatusText = () => {
    // For PROJECT statuses, format them nicely
    if (normalizedStatus === 'onhold') return 'On Hold';
    if (normalizedStatus === 'ontrack') return 'On Track';
    if (normalizedStatus === 'notstarted') return 'Not Started';
    if (normalizedStatus === 'inprogress') return 'In Progress';
    
    // For all other statuses, just capitalize the first letter
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  };
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-normal",
        getStatusStyle(),
        size === 'sm' ? 'text-xs px-1.5 py-0 h-5' : 'px-2 py-0.5',
        className
      )}
    >
      {showText ? getStatusText() : null}
    </Badge>
  );
};

export default StatusBadge;
