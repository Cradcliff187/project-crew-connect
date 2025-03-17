
import { cn } from '@/lib/utils';

type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'on-hold';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case 'draft':
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        label: 'Draft' 
      };
    case 'pending':
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        label: 'Pending' 
      };
    case 'approved':
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Approved' 
      };
    case 'rejected':
      return { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Rejected' 
      };
    case 'active':
      return { 
        bg: 'bg-construction-100', 
        text: 'text-construction-700', 
        label: 'Active' 
      };
    case 'completed':
      return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        label: 'Completed' 
      };
    case 'on-hold':
      return { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        label: 'On Hold' 
      };
    default:
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        label: status 
      };
  }
};

const StatusBadge = ({ status, size = 'md', className }: StatusBadgeProps) => {
  const { bg, text, label } = getStatusConfig(status);

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full", 
        bg, 
        text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default StatusBadge;
