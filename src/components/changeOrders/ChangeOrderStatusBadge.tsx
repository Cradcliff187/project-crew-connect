import { Badge } from '@/components/ui/badge';
import { ChangeOrderStatus } from '@/types/changeOrders';

interface ChangeOrderStatusBadgeProps {
  status: ChangeOrderStatus;
  className?: string;
}

const ChangeOrderStatusBadge = ({ status, className = '' }: ChangeOrderStatusBadgeProps) => {
  // Generate status-specific classes
  const getStatusClasses = () => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/30';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'IMPLEMENTED':
        return 'bg-[#0485ea]/20 text-[#0485ea] border-[#0485ea]/30';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  // Generate a user-friendly label from the status
  const getLabel = () => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <Badge variant="outline" className={`${getStatusClasses()} ${className}`}>
      {getLabel()}
    </Badge>
  );
};

export default ChangeOrderStatusBadge;
