import React from 'react';
import { cn } from '@/lib/utils';

// Define the possible priority levels explicitly
type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | string | null | undefined;

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const getPriorityStyles = (priority: Priority): string => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800';
    case 'LOW':
      return 'bg-blue-100 text-blue-800';
    default:
      // Default to MEDIUM styles if priority is null, undefined, or unknown
      return 'bg-amber-100 text-amber-800';
  }
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const priorityText = priority || 'Medium'; // Default text
  const styles = getPriorityStyles(priority);

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles, className)}>
      {/* Capitalize first letter for display */}
      {priorityText.charAt(0).toUpperCase() + priorityText.slice(1).toLowerCase()}
    </span>
  );
};

export default PriorityBadge;
