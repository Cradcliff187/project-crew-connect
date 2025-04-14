import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Pencil } from 'lucide-react';

interface RevisionChangeBadgeProps {
  changeType: 'new' | 'modified' | 'sent';
  size?: 'sm' | 'default';
}

const RevisionChangeBadge: React.FC<RevisionChangeBadgeProps> = ({
  changeType,
  size = 'default',
}) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  switch (changeType) {
    case 'new':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Plus className={`${iconSize} mr-1`} />
          New
        </Badge>
      );
    case 'modified':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Pencil className={`${iconSize} mr-1`} />
          Modified
        </Badge>
      );
    case 'sent':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className={`${iconSize} mr-1`} />
          Recent
        </Badge>
      );
    default:
      return null;
  }
};

export default RevisionChangeBadge;
