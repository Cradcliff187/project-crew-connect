
import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, AlertCircle, Clock } from 'lucide-react';

interface DueStatusBadgeProps {
  daysUntilDue: number | null;
  className?: string;
}

const DueStatusBadge: React.FC<DueStatusBadgeProps> = ({ daysUntilDue, className }) => {
  if (daysUntilDue === null) {
    return (
      <div className={cn("flex items-center text-muted-foreground font-opensans", className)}>
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        <span>No due date</span>
      </div>
    );
  }
  
  const getBadgeStyle = () => {
    if (daysUntilDue < 0) {
      return "bg-red-100 text-red-800 border border-red-200"; // Overdue
    } else if (daysUntilDue === 0) {
      return "bg-orange-100 text-orange-800 border border-orange-200"; // Due today
    } else if (daysUntilDue <= 2) {
      return "bg-amber-100 text-amber-800 border border-amber-200"; // Due soon (within 2 days)
    } else if (daysUntilDue <= 7) {
      return "bg-construction-100 text-construction-800 border border-construction-200"; // Due this week - using brand blue
    } else {
      return "bg-green-100 text-green-800 border border-green-200"; // Due later
    }
  };
  
  const getIcon = () => {
    if (daysUntilDue < 0) {
      return <AlertCircle className="h-3.5 w-3.5 mr-1.5" />; // Overdue
    } else if (daysUntilDue <= 2) {
      return <Clock className="h-3.5 w-3.5 mr-1.5" />; // Due soon
    } else {
      return <Calendar className="h-3.5 w-3.5 mr-1.5" />; // Due later
    }
  };
  
  const getLabel = () => {
    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`;
    } else if (daysUntilDue === 0) {
      return "Due today";
    } else if (daysUntilDue === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };
  
  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-opensans", 
      getBadgeStyle(), 
      className
    )}>
      {getIcon()}
      <span>{getLabel()}</span>
    </div>
  );
};

export default DueStatusBadge;
