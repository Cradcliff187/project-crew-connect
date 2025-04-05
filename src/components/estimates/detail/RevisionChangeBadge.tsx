
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, PenLine } from 'lucide-react';

type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

interface RevisionChangeBadgeProps {
  changeType: ChangeType;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const RevisionChangeBadge: React.FC<RevisionChangeBadgeProps> = ({ 
  changeType, 
  size = 'md',
  showLabel = true
}) => {
  const getIconAndStyles = () => {
    switch (changeType) {
      case 'added':
        return {
          icon: <ArrowUp className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          classes: 'bg-green-100 text-green-800 border-green-200',
          label: 'Added'
        };
      case 'removed':
        return {
          icon: <ArrowDown className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          classes: 'bg-red-100 text-red-800 border-red-200',
          label: 'Removed'
        };
      case 'modified':
        return {
          icon: <PenLine className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Modified'
        };
      default:
        return {
          icon: <Minus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          classes: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'Unchanged'
        };
    }
  };
  
  const { icon, classes, label } = getIconAndStyles();
  
  return (
    <Badge className={`${classes} ${size === 'sm' ? 'text-xs py-0 px-1.5' : 'text-xs py-0.5 px-2'} font-medium`} variant="outline">
      {icon}
      {showLabel && <span className="ml-1">{label}</span>}
    </Badge>
  );
};

export default RevisionChangeBadge;
