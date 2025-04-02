
import React from 'react';
import { getStatusColorClass, getStatusDisplayName } from '@/utils/statusTransitions';
import { EntityType } from '@/hooks/useStatusHistory';

interface StatusBadgeProps {
  status: string;
  entityType: EntityType;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  entityType,
  size = 'md'
}) => {
  const colorClass = getStatusColorClass(entityType, status);
  const displayName = getStatusDisplayName(entityType, status);
  
  const sizeClasses = {
    sm: 'py-0.5 px-2 text-xs',
    md: 'py-1 px-2.5 text-sm',
    lg: 'py-1.5 px-3 text-base'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClasses[size]} font-medium`}
    >
      {displayName}
    </span>
  );
};

export default StatusBadge;
