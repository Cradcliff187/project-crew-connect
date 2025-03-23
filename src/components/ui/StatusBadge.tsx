
import { cn } from "@/lib/utils";
import { StatusType } from '@/types/common';
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, CircleDashed } from 'lucide-react';

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
  
  const getStatusIcon = () => {
    switch (statusLower) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />;
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="h-3.5 w-3.5 mr-1.5" />;
      case 'on_hold':
      case 'on-hold':
        return <Clock className="h-3.5 w-3.5 mr-1.5" />;
      default:
        return <CircleDashed className="h-3.5 w-3.5 mr-1.5" />;
    }
  };
  
  const getStatusColor = () => {
    switch (statusLower) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'qualified':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'potential':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'prospect':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'completed':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'on-hold':
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'new':
      case 'in_progress':
        return 'bg-[#0485ea]/10 text-[#0485ea] border border-[#0485ea]/20';
      case 'unknown':
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium font-opensans",
        size === 'sm' ? 'text-xs' : 'text-sm',
        getStatusColor(),
        className
      )}
    >
      {getStatusIcon()}
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
