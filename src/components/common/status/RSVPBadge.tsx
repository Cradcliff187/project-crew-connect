import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, HelpCircle, Clock } from 'lucide-react';

export type RSVPStatus = 'accepted' | 'declined' | 'needsAction' | 'tentative';

interface RSVPBadgeProps {
  status: RSVPStatus | null | undefined;
  size?: 'sm' | 'default';
  className?: string;
}

const RSVPBadge: React.FC<RSVPBadgeProps> = ({ status, size = 'default', className = '' }) => {
  const getStatusDetails = (
    currentStatus?: RSVPStatus | null
  ): { icon: React.ReactNode; classes: string; label: string } => {
    switch (currentStatus) {
      case 'accepted':
        return {
          icon: <CheckCircle />,
          classes: 'bg-green-50 text-green-700 border-green-200',
          label: 'Accepted',
        };
      case 'declined':
        return {
          icon: <XCircle />,
          classes: 'bg-red-50 text-red-700 border-red-200',
          label: 'Declined',
        };
      case 'tentative':
        return {
          icon: <Clock />,
          classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          label: 'Tentative',
        };
      case 'needsAction':
      default:
        return {
          icon: <HelpCircle />,
          classes: 'bg-gray-50 text-gray-600 border-gray-200',
          label: 'Pending',
        };
    }
  };

  const { icon, classes, label } = getStatusDetails(status);
  const sizeClasses =
    size === 'sm' ? 'px-1.5 py-0 text-[10px] h-[18px]' : 'px-2.5 py-0.5 text-xs h-[22px]';
  const iconClasses = 'mr-1 h-3 w-3';

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
      <span>{label}</span>
    </Badge>
  );
};

export default RSVPBadge;
