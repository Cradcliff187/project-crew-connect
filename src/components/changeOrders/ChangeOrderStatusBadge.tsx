
import { Badge } from '@/components/ui/badge';
import { ChangeOrderStatus } from '@/types/changeOrders';

interface ChangeOrderStatusBadgeProps {
  status: ChangeOrderStatus;
  className?: string;
}

const ChangeOrderStatusBadge = ({ status, className = '' }: ChangeOrderStatusBadgeProps) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="outline" className={`bg-gray-100 ${className}`}>Draft</Badge>;
    case 'SUBMITTED':
      return <Badge variant="outline" className={`bg-blue-100 text-blue-800 ${className}`}>Submitted</Badge>;
    case 'REVIEW':
      return <Badge variant="outline" className={`bg-yellow-100 text-yellow-800 ${className}`}>In Review</Badge>;
    case 'APPROVED':
      return <Badge variant="outline" className={`bg-green-100 text-green-800 ${className}`}>Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="outline" className={`bg-red-100 text-red-800 ${className}`}>Rejected</Badge>;
    case 'IMPLEMENTED':
      return <Badge variant="outline" className={`bg-purple-100 text-purple-800 ${className}`}>Implemented</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className={`bg-gray-100 text-gray-800 ${className}`}>Cancelled</Badge>;
    default:
      return <Badge variant="outline" className={className}>{status}</Badge>;
  }
};

export default ChangeOrderStatusBadge;
