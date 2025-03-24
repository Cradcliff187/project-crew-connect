
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusType } from '@/types/common';
import { CheckCircle2, AlertCircle, CircleDashed, Clock } from 'lucide-react';

interface SubcontractorStatusBadgeProps {
  status: string | null;
}

const SubcontractorStatusBadge = ({ status }: SubcontractorStatusBadgeProps) => {
  if (!status) return <Badge variant="outline" className="font-opensans flex items-center">
    <CircleDashed className="mr-1.5 h-3.5 w-3.5" />Unknown
  </Badge>;
  
  const getStatusIcon = (statusType: StatusType) => {
    switch (statusType) {
      case 'success':
        return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />;
      case 'warning':
        return <Clock className="mr-1.5 h-3.5 w-3.5" />;
      case 'error':
        return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
      default:
        return <CircleDashed className="mr-1.5 h-3.5 w-3.5" />;
    }
  };
  
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
      className = 'bg-green-50 text-green-700 border-green-200 font-medium';
      break;
    case 'info':
      className = 'bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd] font-medium';
      break;
    case 'warning':
      className = 'bg-yellow-50 text-yellow-700 border-yellow-200 font-medium';
      break;
    case 'error':
      className = 'bg-red-50 text-red-700 border-red-200 font-medium';
      break;
    case 'neutral':
      className = 'bg-gray-50 text-gray-700 border-gray-200 font-medium';
      break;
    case 'purple':
      className = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
      break;
  }
  
  return (
    <Badge variant="outline" className={`font-opensans flex items-center ${className}`}>
      {getStatusIcon(statusType)}
      {status}
    </Badge>
  );
};

export default SubcontractorStatusBadge;
