import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';
import {
  CheckCircle2,
  AlertCircle,
  CircleDashed,
  Clock,
  XCircle,
  Check,
  Send,
  Eye,
  FileCheck,
  MinusCircle,
  Info,
  HelpCircle,
  Archive,
  ThumbsUp,
  ThumbsDown,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: StatusType | string | null | undefined;
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
  const safeStatus = status ? status.toUpperCase().replace(/-/g, '_') : 'UNKNOWN';

  const getStatusDetails = (currentStatus: string): { icon: React.ReactNode; classes: string } => {
    switch (currentStatus) {
      // Success / Positive States
      case 'COMPLETED':
      case 'APPROVED':
      case 'ACTIVE':
      case 'VERIFIED':
      case 'IMPLEMENTED':
        return { icon: <CheckCircle2 />, classes: 'bg-green-50 text-green-700 border-green-200' };
      case 'CONVERTED':
        return { icon: <FileCheck />, classes: 'bg-green-50 text-green-700 border-green-200' };
      case 'SENT':
        return { icon: <Send />, classes: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'READY':
      case 'QUALIFIED':
        return { icon: <ThumbsUp />, classes: 'bg-teal-50 text-teal-700 border-teal-200' };

      // In Progress / Neutral States
      case 'IN_PROGRESS':
      case 'SUBMITTED':
      case 'REVIEW':
        return { icon: <Clock />, classes: 'bg-primary/10 text-primary border-primary/20' };
      case 'PENDING':
        return { icon: <Info />, classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      case 'NEW':
        return { icon: <Info />, classes: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'DRAFT':
        return { icon: <CircleDashed />, classes: 'bg-gray-50 text-gray-700 border-gray-200' };

      // Warning / Hold States
      case 'ON_HOLD':
        return { icon: <MinusCircle />, classes: 'bg-orange-50 text-orange-700 border-orange-200' };

      // Negative / Error States
      case 'REJECTED':
      case 'CANCELLED':
        return { icon: <XCircle />, classes: 'bg-red-50 text-red-700 border-red-200' };
      case 'INACTIVE':
        return { icon: <Archive />, classes: 'bg-gray-50 text-gray-600 border-gray-200' }; // Muted gray

      // Unknown / Default
      case 'UNKNOWN':
      default:
        return { icon: <HelpCircle />, classes: 'bg-gray-50 text-gray-500 border-gray-200' };
    }
  };

  // Generate a display label from the status if none provided
  const getDisplayLabel = () => {
    if (label) return label;
    if (!safeStatus || safeStatus === 'UNKNOWN') return 'Unknown';

    // Convert status to readable format (e.g., IN_PROGRESS -> In Progress)
    return safeStatus
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const { icon, classes } = getStatusDetails(safeStatus);
  const sizeClasses =
    size === 'sm' ? 'px-1.5 py-0 text-[10px] h-[18px]' : 'px-2.5 py-0.5 text-xs h-[22px]'; // Adjusted height for better alignment
  const iconClasses = 'mr-1 h-3 w-3'; // Adjusted icon size

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium flex items-center whitespace-nowrap',
        classes,
        sizeClasses,
        className
      )}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement, { className: iconClasses })
        : null}
      <span>{getDisplayLabel()}</span>
    </Badge>
  );
};

export default StatusBadge;
