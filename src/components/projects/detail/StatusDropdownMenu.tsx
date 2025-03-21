
import { Check, AlertCircle, Pause, X, Play, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatusOption {
  status: string;
  label: string;
}

interface StatusDropdownMenuProps {
  availableStatuses: StatusOption[];
  updating: boolean;
  onStatusChange: (newStatus: string) => void;
}

const StatusDropdownMenu = ({ 
  availableStatuses, 
  updating, 
  onStatusChange 
}: StatusDropdownMenuProps) => {
  // Get the appropriate icon for each status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Play className="mr-2 h-4 w-4 text-emerald-500" />;
      case 'on_hold':
        return <Pause className="mr-2 h-4 w-4 text-amber-500" />;
      case 'completed':
        return <Check className="mr-2 h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="mr-2 h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="mr-2 h-4 w-4 text-blue-500" />;
      case 'new':
        return <ArrowUpRight className="mr-2 h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={updating} className="ml-2">
          {updating ? 'Updating...' : 'Change Status'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableStatuses.map((statusOption) => (
          <DropdownMenuItem 
            key={statusOption.status}
            onClick={() => onStatusChange(statusOption.status)}
            className="cursor-pointer flex items-center"
          >
            {getStatusIcon(statusOption.status)}
            {statusOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdownMenu;
