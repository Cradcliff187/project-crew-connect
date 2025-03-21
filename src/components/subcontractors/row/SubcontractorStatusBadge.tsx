
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';

interface SubcontractorStatusBadgeProps {
  status: string | null;
}

const SubcontractorStatusBadge = ({ status }: SubcontractorStatusBadgeProps) => {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  
  const mapStatusToType = (status: string): StatusType => {
    const statusUpperCase = status.toUpperCase();
    
    switch (statusUpperCase) {
      case 'ACTIVE':
        return 'success';
      case 'QUALIFIED':
      case 'VERIFIED':
      case 'PREFERRED':
        return 'info';
      case 'PENDING':
      case 'REVIEW_NEEDED':
        return 'warning';
      case 'INACTIVE':
        return 'neutral';
      case 'REJECTED':
        return 'error';
      default:
        return 'neutral';
    }
  };
  
  const statusType = mapStatusToType(status);
  
  let className = 'bg-gray-50 text-gray-700 border-gray-200';
  
  switch (statusType) {
    case 'success':
      className = 'bg-green-50 text-green-700 border-green-200';
      break;
    case 'info':
      className = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'warning':
      className = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      break;
    case 'error':
      className = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'neutral':
      className = 'bg-gray-50 text-gray-700 border-gray-200';
      break;
    case 'purple':
      className = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
  }
  
  return <Badge variant="outline" className={className}>{status}</Badge>;
};

export default SubcontractorStatusBadge;
