
import React from 'react';
import { cn } from '@/lib/utils';
import { CalendarClock } from 'lucide-react';

interface DueStatusBadgeProps {
  daysUntilDue: number | null;
  className?: string;
}

const DueStatusBadge: React.FC<DueStatusBadgeProps> = ({ daysUntilDue, className }) => {
  if (daysUntilDue === null) {
    return (
      <span className={cn("inline-flex items-center text-sm text-gray-500", className)}>
        Not set
      </span>
    );
  }

  if (daysUntilDue < 0) {
    // Overdue
    return (
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", className)}>
        <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
        {Math.abs(daysUntilDue)} days overdue
      </span>
    );
  }

  if (daysUntilDue === 0) {
    // Due today
    return (
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800", className)}>
        <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
        Due today
      </span>
    );
  }

  if (daysUntilDue <= 3) {
    // Due soon (within 3 days)
    return (
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800", className)}>
        <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
        {daysUntilDue} days
      </span>
    );
  }

  // Not urgent
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", className)}>
      <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
      {daysUntilDue} days
    </span>
  );
};

export default DueStatusBadge;
